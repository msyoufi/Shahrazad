interface Painting {
  id: string,
  name: string,
  color_material: string,
  surface_material: string,
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