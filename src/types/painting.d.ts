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
  id: string,
  larg: string,
  thumbnail: string
  order: number,
}

type PaintingFormData = Omit<Painting, 'id' | 'main_image' | 'close_ups' | 'order'>;