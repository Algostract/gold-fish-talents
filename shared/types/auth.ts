import { z } from 'zod'

/* Schema */
export const emailFormSchema = z.object({
  email: z.email('Please enter a valid email address'),
  otp: z.string().optional(),
})

export const userFormSchema = z.object({
  name: z.string().min(2, 'Please enter your full name'),
  dob: z.string().nonempty('Please provide date of birth'),
  gender: z.enum(['male', 'female', 'other']),
  phone: z
    .string()
    .min(7, 'Enter valid phone number')
    .regex(/^\+?\d{7,15}$/, 'Invalid phone number'),
})

export const modelFormSchema = z.object({
  name: z.string().min(2, 'Please enter your full name'),
  dob: z.string().nonempty('Please provide date of birth'),
  gender: z.enum(['male', 'female', 'other']),
  // education
  profession: z.string().min(2, 'Enter your profession'),
  coordinate: z
    .tuple([
      z.number().min(-90).max(90), // latitude
      z.number().min(-180).max(180), // longitude
    ])
    .describe('Coordinate [latitude, longitude]'),
  height: z.preprocess((v) => (typeof v === 'string' ? Number(v) : v), z.number().min(30, 'Height looks too small').max(300, 'Height looks too large')),
  weight: z.preprocess((v) => (typeof v === 'string' ? Number(v) : v), z.number().min(20, 'Weight looks too small').max(500, 'Weight looks too large')),
  shoulder: z.preprocess((v) => (typeof v === 'string' ? Number(v) : v), z.number().min(25, 'Shoulder looks too small').max(100, 'Shoulder looks too large')),
  waist: z.preprocess((v) => (typeof v === 'string' ? Number(v) : v), z.number().min(40, 'Waist looks too small').max(150, 'Waist looks too large')),
  phone: z
    .string()
    .min(7, 'Enter valid phone number')
    .regex(/^\+?\d{7,15}$/, 'Invalid phone number'),
  sameAsPhone: z.boolean(),
  whatsapp: z.string().optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  fee: z.preprocess((v) => (typeof v === 'string' ? Number(v) : v), z.number().min(0, 'Fee must be zero or more')),
  why: z.string().min(10, 'Tell us at least 10 characters'),
})
/*   .superRefine((obj, ctx) => {
    // If sameAsPhone is true, copy/require whatsapp to match phone
    if (obj.sameAsPhone) {
      // we don't add an issue if it's empty; form will copy phone -> whatsapp in UI
      return
    }
    // when not sameAsPhone, whatsapp must be present and valid
    if (!obj.whatsapp || !/^\+?\d{7,15}$/.test(obj.whatsapp)) {
      ctx.addIssue({ path: ['whatsapp'], message: 'Enter a valid WhatsApp number or mark it as same as phone' })
    }
  }) */
