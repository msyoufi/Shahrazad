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
  large: string,
  thumbnail: string
  order: number,
}

interface LocalImageUrl {
  file: File
  thumbnail: string
}

type PaintingFormData = Omit<Painting, 'id' | 'main_image' | 'close_ups' | 'order'>;