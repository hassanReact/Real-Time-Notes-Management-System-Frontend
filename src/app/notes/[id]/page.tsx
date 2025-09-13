import { NoteEditor } from "../_components/note-editor"

interface NotePageProps {
  params: {
    id: string
  }
}

export default function NotePage({ params }: NotePageProps) {
  return <NoteEditor noteId={params.id} />
}
