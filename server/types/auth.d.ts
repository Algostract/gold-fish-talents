declare module '#auth-utils' {
  interface User {
    id: string
    name: string
    avatar?: string
    email: string
    createdAt: string
    updatedAt: string
    isProfileComplete: boolean
  }

  /*  interface UserSession {
     // Add your own fields
   }
 
   interface SecureSessionData {
     // Add your own fields
   } */
}

export {}
