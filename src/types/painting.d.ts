interface Painting {
  id: string,
  title: string,
  material: string,
  width: number,
  height: number,
  year: number,
  order: number
  main_image: ImageUrls,
  close_ups: ImageUrls[]
}

interface ImageUrls {
  larg: string,
  thumbnail: string
}