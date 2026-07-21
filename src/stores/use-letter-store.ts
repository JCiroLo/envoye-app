import { create } from 'zustand'

export type Letter = {
  id: string
  eventId: string
  userName: string
  message: string
  mediaType: 'image' | 'video' | 'audio' | 'text'
  mediaUrl: string
  createdAt: number
}

type LetterStore = {
  letters: Letter[]
  addLetter: (letter: Omit<Letter, 'id' | 'createdAt'>) => void
  resetStore: () => void
}

const initialMockLetters: Letter[] = [
  {
    id: 'mock-1',
    eventId: 'default-event',
    userName: 'Sofía & Alejandro',
    message: '¡Muchas felicidades en su boda! Que este nuevo camino esté lleno de amor, comprensión y risas interminables. ¡Los queremos muchísimo!',
    mediaType: 'image',
    mediaUrl: 'https://images.pexels.com/photos/36763402/pexels-photo-36763402.jpeg',
    createdAt: Date.now() - 3600000 * 5,
  },
  {
    id: 'mock-2',
    eventId: 'default-event',
    userName: 'Mateo',
    message: '¡Feliz cumpleaños hermano! Que este año traiga puros éxitos, buena música y aventuras inolvidables. ¡A celebrar en grande!',
    mediaType: 'image',
    mediaUrl: 'https://images.pexels.com/photos/36733339/pexels-photo-36733339.jpeg',
    createdAt: Date.now() - 3600000 * 4,
  },
  {
    id: 'mock-3',
    eventId: 'default-event',
    userName: 'Familia Gómez',
    message: 'Que alegría poder compartir este día tan especial con ustedes. Les deseamos toda la felicidad del mundo en esta nueva etapa juntos.',
    mediaType: 'image',
    mediaUrl: 'https://images.pexels.com/photos/7803654/pexels-photo-7803654.jpeg',
    createdAt: Date.now() - 3600000 * 3,
  },
  {
    id: 'mock-4',
    eventId: 'default-event',
    userName: 'Camila R.',
    message: '¡Felicidades! Disfruten al máximo este día increíble. Les mando un abrazo gigante y mis mejores vibras para el futuro.',
    mediaType: 'image',
    mediaUrl: 'https://images.pexels.com/photos/29763536/pexels-photo-29763536.jpeg',
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'mock-5',
    eventId: 'default-event',
    userName: 'Andrés y Laura',
    message: '¡El mejor evento del año! Gracias por invitarnos. Que viva el amor y la buena vibra hoy y siempre.',
    mediaType: 'image',
    mediaUrl: 'https://images.pexels.com/photos/7514874/pexels-photo-7514874.jpeg',
    createdAt: Date.now() - 3600000,
  },
]

const useLetterStore = create<LetterStore>((set) => ({
  letters: initialMockLetters,
  addLetter: (newLetter) => {
    const letterWithMetadata: Letter = {
      ...newLetter,
      id: `letter-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
    }
    set((state) => ({
      letters: [letterWithMetadata, ...state.letters],
    }))
  },
  resetStore: () => {
    set({ letters: initialMockLetters })
  },
}))

export default useLetterStore
