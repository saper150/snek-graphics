package main

import (
	"html/template"
	"image"
	"image/color"
	"image/png"
	_ "image/png"
	"math"
	"os"
	"runtime"
	"sync"
)

type binaryImage struct {
	data   []bool
	width  int
	height int
}

type point struct {
	x int
	y int
}

func bfs(img binaryImage, start point) float64 {

	visited := make(map[point]struct{})
	queue := make([]point, 0)
	queue = append(queue, start)
	visited[start] = struct{}{}
	for len(queue) > 0 {
		current := queue[0]
		queue = queue[1:]

		if b_at(img, current) {

			deg := math.Atan2(float64(current.y-start.y), float64(current.x-start.x)) * (180 / math.Pi)
			if deg < 0 {
				return deg + 360.0
			} else {
				return deg
			}

		}

		if current.x > 0 {
			point := point{x: current.x - 1, y: current.y}
			if _, ok := visited[point]; !ok {
				queue = append(queue, point)
				visited[point] = struct{}{}
			}
		}

		if current.x < img.width-1 {
			point := point{x: current.x + 1, y: current.y}
			if _, ok := visited[point]; !ok {
				queue = append(queue, point)
				visited[point] = struct{}{}
			}
		}

		if current.y < img.height-1 {
			point := point{x: current.x, y: current.y + 1}
			if _, ok := visited[point]; !ok {
				queue = append(queue, point)
				visited[point] = struct{}{}
			}
		}

		if current.y > 0 {
			point := point{x: current.x, y: current.y - 1}
			if _, ok := visited[point]; !ok {
				queue = append(queue, point)
				visited[point] = struct{}{}
			}
		}

	}

	return -1

}

func emptyBinaryImage(width int, height int) binaryImage {
	data := make([]bool, width*height)
	return binaryImage{data, width, height}

}

func newBinaryImage(img image.Image) binaryImage {

	bounds := img.Bounds()
	bImage := emptyBinaryImage(bounds.Max.X, bounds.Max.Y)

	for y := 0; y < bImage.height; y++ {
		for x := 0; x < bImage.width; x++ {
			r, g, b, _ := img.At(x, y).RGBA()
			bImage.data[y*bounds.Max.X+x] = r>>8+g>>8+b>>8 < 300
		}
	}

	return bImage
}

func b_at(im binaryImage, p point) bool {
	return im.data[im.width*p.y+p.x]
}

func b_set(im binaryImage, p point, val bool) {
	im.data[im.width*p.y+p.x] = val
}

func load(filePath string) image.Image {
	imgFile, err := os.Open(filePath)
	defer imgFile.Close()
	if err != nil {
		panic(err)
	}

	img, _, err := image.Decode(imgFile)
	if err != nil {
		panic(err)
	}
	return img
}

type encodeData struct {
	Height int
	Width  int
	Data   []float64
}

func encode(width int, height int, res []float64) {

	template := template.New("Template_1")

	template, _ = template.Parse("export const data = { width: {{.Width}}, height:{{.Height}}, data: [ {{range $val := .Data}}{{$val}},{{end}} ]  }")

	resFile, err := os.Create("sketch/flowData.ts")
	if err != nil {
		panic(err)
	}

	template.Execute(resFile, encodeData{width, height, res})

}

func findStart(img binaryImage) point {
	for x := 0; x < img.width; x++ {
		for y := 0; y < img.height; y++ {
			if b_at(img, point{x, y}) {
				return point{x, y}
			}
		}
	}

	panic("start not found")
}

func bfsImg(img binaryImage) binaryImage {
	start := findStart(img)

	cameFrom := make(map[point]point)
	queue := make([]point, 0)
	queue = append(queue, start)

	cameFrom[start] = start
	posibleNeabours := [8]point{{0, 1}, {1, 1}, {1, 0}, {1, -1}, {0, -1}, {-1, -1}, {-1, 0}, {-1, 1}}
	deadEnds := make([]point, 0)

	for len(queue) > 0 {
		current := queue[0]
		queue = queue[1:]

		isDeadEnd := true
		for _, p := range posibleNeabours {
			newPoint := point{current.x + p.x, current.y + p.y}
			if newPoint.x > 0 && newPoint.y > 0 && newPoint.x < img.width && newPoint.y < img.height && b_at(img, newPoint) {
				if _, ok := cameFrom[newPoint]; !ok {
					queue = append(queue, newPoint)
					cameFrom[newPoint] = current
					isDeadEnd = false
				}
			}
		}

		if isDeadEnd {
			deadEnds = append(deadEnds, current)
		}
	}

	// newImage := emptyBinaryImage(img.width, img.height)

	for _, end := range deadEnds {
		b_set(img, end, false)

		// current := end
		// for {

		// 	cameFrom, ok := cameFrom[current]

		// 	if ok && cameFrom != start {
		// 		// fmt.Printf("%d\n", cameFrom.x)
		// 		current = cameFrom
		// 	} else {
		// 		break
		// 	}
		// }
	}

	return img
	// fmt.Printf("%d", len(deadEnds))

}

func saveBinaryImage(binaryImage binaryImage) {

	upLeft := image.Point{0, 0}
	lowRight := image.Point{binaryImage.width, binaryImage.height}

	img := image.NewRGBA(image.Rectangle{upLeft, lowRight})
	for x := 0; x < binaryImage.width; x++ {
		for y := 0; y < binaryImage.height; y++ {
			if b_at(binaryImage, point{x, y}) {
				img.Set(x, y, color.RGBA{0, 0, 0, 0xff})
			} else {
				img.Set(x, y, color.RGBA{255, 255, 255, 0xff})
			}
		}
	}

	f, _ := os.Create("out2.png")
	png.Encode(f, img)
}

func main() {
	runtime.GOMAXPROCS(4)
	src := load("./strok-w.png")
	b := newBinaryImage(src)

	res := make([]float64, b.width*b.height)
	// threads := 16
	var wg sync.WaitGroup

	saveBinaryImage(bfsImg(b))

	// count := b.height * b.width / threads
	// for i := 0; i < threads; i++ {
	// 	i := i
	// 	wg.Add(1)
	// 	go func() {
	// 		defer wg.Done()
	// 		for ii := i * count; ii < (i+1)*count; ii++ {
	// 			y := ii / b.width
	// 			x := ii % b.width
	// 			res[ii] = bfs(b, point{x, y})

	// 			if ii%1000 == 0 {
	// 				print(".")
	// 			}
	// 		}
	// 	}()
	// }
	// println(b.height*b.width - threads*count)
	// for ii := threads * count; ii < b.height*b.width; ii++ {
	// 	y := ii / b.width
	// 	x := ii % b.width
	// 	res[ii] = bfs(b, point{x, y})
	// }

	// for y := 0; y < b.height; y++ {
	// 	for x := 0; x < b.width; x++ {
	// 		wg.Add(1)
	// 		x := x
	// 		y := y
	// 		go func() {
	// 			defer wg.Done()
	// 			res[y*b.width+x] = bfs(b, point{x, y})

	// 			if atomic.AddInt32(&ops, 1)%one == 0 {
	// 				fmt.Printf(".")
	// 			}

	// 		}()

	// 	}
	// }

	wg.Wait()
	encode(b.width, b.height, res)

	// // Encode the grayscale image to the output file
	// outfile, err := os.Create("oo.png")
	// if err != nil {
	// 	panic(err)
	// }
	// defer outfile.Close()
	// png.Encode(outfile, out)
}
