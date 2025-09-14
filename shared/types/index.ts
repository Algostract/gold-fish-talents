/* Interface */
export interface Photo {
  id: string
  title: string
  image?: string
  description: string
  featured: boolean
  aspectRatio: number
  projectId: string
  url: string
}

export type Gender = 'male' | 'female' | 'other'

export interface Model {
  id: string
  name: string
  gender: 'male' | 'female' | 'other'
  age: number
  fee: number
  coordinate: [number, number]
  photo: Pick<Photo, 'title' | 'description' | 'image' | 'aspectRatio'>
  rating: number
  reviewCount: number
  isFeatured?: boolean
  url: string
}

export interface DetailedModel extends Model {
  description: string
  details: {
    /* location: {
      city: string
      neighborhood: string
    } */
    physicalAttributes: {
      height: number
      weight: number
      shoulder: number
      waist: number
      tattoos: string
      /* bodyType: 'Ectomorph' | 'Mesomorph' | 'Endomorph'
      skinTone: string
      eyeColor: string
      hairColor: string
      shoeSize: number
      bust: number
      hips: number
      armpitHair: 'None' | 'Trimmed' | 'Natural' */
    }
    professionalBackground: {
      profession: string
      education: string
      /* hasPassport: boolean
       experienceYears: number */
    }
    /*  skillsInterests: {
       languages: string[]
       hobbies: string[]
       comfortableTimings: boolean
       travelOutstation: boolean
       travelInternational: boolean
     } */
    /* shootPreferences: {
      preferredGenres: ('Acting' | 'PrintEditorial' | 'EthnicFashion' | 'WesternFashion' | 'RampRunway' | 'MusicVideos' | 'WebSeries' | 'Anchoring')[]
      preferredWardrobe: ('EthnicWear' | 'WesternWear' | 'SwimSuits')[]
      experiencedGenres: string[]
    } */
    healthSafety: {
      allergies: string
    }
  }
  projects: Project[]
  media: {
    photo: Photo[]
    video: Video[]
  }
}

export interface Project {
  id: string
  name: string
  image?: string
  datetime: string
  location: {
    name: string
    address: string
  }
  mapUrl: string
  helpline: string
  media: {
    photo: Photo[]
    video: Video[]
  }
}

export interface SearchParams {
  query: string
  queryBy: string
}

export interface PageParams {
  perPage: number
  page: number
}

export interface PaginatedSearchParams extends SearchParams, PageParams {
  filterBy: string
  sortBy: string
}

type Orientation = 'portrait' | 'landscape'

export type FileSources = {
  [codec in Codec]?: { type: string } & {
    [resolution in Resolution]?: Orientation[]
  }
}

export interface Source {
  src: string
  type: string
  media: string
  codec: Codec
  resolution: Resolution
  orientation: Orientation
}

export interface Video {
  id: string
  title: string
  description: string
  type: 'hero' | 'feature'
  poster?: string
  // category: Category
  featured: boolean
  sources: Source[]
  projectId: string
  url: string
}

/* Server Only */
export const resourceTypes = ['project', 'model', 'studio', 'asset'] as const

export type ResourceType = (typeof resourceTypes)[number]

export type NotionDB = { [K in ResourceType]: string }

type NotionImage =
  | {
      type: 'file'
      file: {
        url: string
        expiry_time: string
      }
    }
  | {
      type: 'external'
      external: {
        url: string
      }
    }
  | null

export interface NotionProject {
  id: string
  created_time: Date
  last_edited_time: Date
  cover: NotionImage
  icon: NotionImage
  properties: {
    Name: {
      type: 'title'
      title: { plain_text: string }[]
    }
    Address: {
      type: 'rich_text'
      rich_text: { text: { content: string } }[]
    }
    Map: {
      type: 'url'
      url: string
    }
    'Shoot Date/Time': {
      type: 'date'
      date: {
        start: string
        end: string
      }
    }
    Model: {
      type: 'relation'
      relation: { id: string }[]
      has_more: boolean
    }
    Asset: {
      type: 'relation'
      relation: { id: string }[]
      has_more: boolean
    }
  }
  url: string
  public_url: null
}

export interface NotionModel {
  id: string
  created_time: string
  last_edited_time: string
  cover: NotionImage
  icon: NotionImage
  properties: {
    // Index
    Name: {
      type: 'title'
      title: { plain_text: string }[]
    }
    Slug: {
      type: 'formula'
      formula: {
        string: string
      }
    }
    Status: {
      type: 'status'
      status: {
        name: 'Unfilled' | 'Filled' | 'Verified' | 'Active' | 'Inactive'
      }
    }
    Featured: {
      type: 'checkbox'
      checkbox: boolean
    }
    Description: {
      type: 'rich_text'
      rich_text: { text: { content: string } }[]
    }
    Profession: {
      type: 'rich_text'
      rich_text: { text: { content: string } }[]
    }
    Gender: {
      type: 'select'
      select: {
        name: 'Male' | 'Female' | 'Other'
      }
    }
    DOB: {
      type: 'date'
      date: {
        start: string
        end: string
      }
    }
    Height: {
      type: 'number'
      number: number
    }
    Weight: {
      type: 'number'
      number: number
    }
    Shoulder: {
      type: 'number'
      number: number
    }
    Waist: {
      type: 'number'
      number: number
    }
    Latitude: {
      type: 'number'
      number: number
    }
    Longitude: {
      type: 'number'
      number: number
    }
    Fee: {
      type: 'number'
      number: number
    }
    Email: {
      type: 'email'
      email: string
    }
    Phone: {
      type: 'phone_number'
      phone_number: string
    }
    Whatsapp: {
      type: 'url'
      url: string
    }
    Facebook: {
      type: 'url'
      url: string
    }
    Instagram: {
      type: 'url'
      url: string
    }
    Project: {
      type: 'relation'
      relation: { id: string }[]
      has_more: boolean
    }
    Asset: {
      type: 'relation'
      relation: { id: string }[]
      has_more: boolean
    }
  }
}

export interface NotionAsset {
  id: string
  created_time: string
  last_edited_time: string
  cover: NotionImage
  icon: NotionImage
  properties: {
    Index: { number: number }
    'Project Index': {
      rollup: {
        array: {
          number: number
        }[]
      }
    }
    Name: {
      title: {
        plain_text: string
      }[]
    }
    Slug: {
      formula: {
        string: string
      }
    }
    Description: {
      rich_text: {
        text: {
          content: string
        }
      }[]
    }
    Type: {
      select: {
        name: 'Photo' | 'Video'
      }
    }
    Status: {
      status: {
        name: 'Plan' | 'Draft' | 'Release' | 'Archive'
      }
    }
    Featured: {
      type: 'checkbox'
      checkbox: boolean
    }
    Resolution: {
      select: {
        name: Resolution
      }
    }
    'Aspect ratio': {
      select: {
        name: AspectRatio
      }
    }
    Project: {
      type: 'relation'
      relation: { id: string }[]
      has_more: boolean
    }
    Model: {
      type: 'relation'
      relation: { id: string }[]
      has_more: boolean
    }
  }
}
