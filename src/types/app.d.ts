interface ConfirmationDialogData {
  title: string;
  message: string;
  actionButton: string;
}

interface Profile {
  name: string;
  bio_html: string;
  email: string;
  hero_html: string;
  profileImageUrl: string;
  coverImageUrl: string;
  studioShotsUrls: StudioShotUrl[];
}

interface StudioShotUrl {
  id: string;
  url: string;
  order: number;
}

interface LocalStudioShotImage {
  file: File;
  url: string;
}

interface StoryBlock {
  text: string;
  imageUrl: string;
  loading: boolean;
}
