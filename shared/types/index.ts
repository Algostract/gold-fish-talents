export interface Photo {
  id: string
  title: string
  image?: string
  description: string
  featured: boolean
  aspectRatio: number
  url: string
}

export interface Model {
  id: string
  name: string
  fee: number
  photo: Pick<Photo, 'title' | 'description' | 'image' | 'aspectRatio'>
  rating: number
  reviewCount: number
  isFeatured?: boolean
  coordinate: [number, number]
  url: string
}

export interface DetailedModel extends Model {
  details: {
    personalInfo: {
      gender: 'male' | 'female'
      age: number
    }
    location: {
      city: string
      neighborhood: string
    }
    physicalAttributes: {
      height: number
      weight: number
      bodyType: 'Ectomorph' | 'Mesomorph' | 'Endomorph'
      skinTone: string
      eyeColor: string
      hairColor: string
      shoeSize: number
      bust: number
      waist: number
      hips: number
      tattoos: string
      armpitHair: 'None' | 'Trimmed' | 'Natural'
    }
    professionalBackground: {
      profession: string
      education: string
      hasPassport: boolean
      experienceYears: number
    }
    skillsInterests: {
      languages: string[]
      hobbies: string[]
      comfortableTimings: boolean
      travelOutstation: boolean
      travelInternational: boolean
    }
    shootPreferences: {
      preferredGenres: ('Acting' | 'PrintEditorial' | 'EthnicFashion' | 'WesternFashion' | 'RampRunway' | 'MusicVideos' | 'WebSeries' | 'Anchoring')[]
      preferredWardrobe: ('EthnicWear' | 'WesternWear' | 'SwimSuits')[]
      experiencedGenres: string[]
    }
    healthSafety: {
      allergies: string
    }
  }
}

export interface SearchParams {
  query: string
  queryBy: string
  filterBy: string
  sortBy: string
}

export interface PaginatedSearchParams extends SearchParams {
  perPage: number
  page: number
}

/* Server Only */
export const resourceTypes = ['asset', 'model', 'studio'] as const

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
      title: {
        type: string
        text: {
          content: string
          link: null
        }
        plain_text: string
        href: null
      }[]
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
    Slug: {
      type: 'formula'
      formula: {
        string: string
      }
    }
    Name: {
      type: 'title'
      title: { plain_text: string }[]
    }
    Status: {
      status: {
        name: 'Unverified' | 'Verified' | 'Active' | 'Inactive'
      }
    }
    Gender: {
      select: {
        name: 'Male' | 'Female' | 'Other'
      }
    }
    DOB: {
      date: {
        start: string
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
    Instagram: {
      type: 'url'
      url: string
    }
    Project: {
      type: 'relation'
      relation: string[]
      has_more: false
    }
  }
  url: string
  public_url: null
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
    Project: {
      type: 'relation'
      relation: string[]
      has_more: false
    }
    Model: {
      type: 'relation'
      relation: string[]
      has_more: false
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
  }
}
