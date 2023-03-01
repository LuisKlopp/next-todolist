import { GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';
import { prisma } from '../lib/prisma';
import axios from 'axios';
import { useRouter } from 'next/router';

interface FormData {
  title: string;
  content: string;
  id: string;
}

interface Notes {
  notes: FormData[];
}

export default function Home({ notes }: Notes) {
  const router = useRouter();
  const baseUrl = 'http://localhost:3000/api';
  const [form, setForm] = useState<FormData>({
    title: '',
    content: '',
    id: '',
  });

  const refreshData = () => {
    router.replace(router.asPath);
  };

  async function create(data: FormData) {
    if (data.id) {
      updateNote(data);
      setForm({ title: '', content: '', id: '' });
      return;
    }
    await axios.post(`${baseUrl}/create`, { data }).then(() => {
      setForm({ title: '', content: '', id: '' });
      refreshData();
    });
  }

  async function updateNote(data: FormData) {
    await axios.put(`${baseUrl}/note/${data.id}`, { data }).then(() => {
      refreshData();
    });
  }

  async function deleteNote(id: string) {
    await axios.delete(`${baseUrl}/note/${id}`).then(() => {
      refreshData();
    });
  }

  const handleSubmit = async (data: FormData) => {
    try {
      create(data);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div>
      <h1 className='text-center font-bold text-2xl mt-4'>Notes</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(form);
        }}
        className='w-auto min-w-[25%] max-w-min mx-auto space-y-6 flex flex-col items-stretch'
      >
        <input
          type='text'
          placeholder='Title'
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className='border-2 rounded border-gray-600 p-1'
        />
        <textarea
          placeholder='Content'
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          className='border-2 rounded border-gray-600 p-1'
        />
        <button type='submit' className='bg-blue-500 text-white rounded p-1'>
          Add +
        </button>
      </form>
      <div className='w-auto min-w-[25%] max-w-min mt-20 mx-auto space-y-6 flex flex-col items-stretch'>
        <ul>
          {notes.map((note) => (
            <li key={note.id} className='border-b border-gray-600 p-2'>
              <div className='flex justify-between'>
                <div className='flex-1'>
                  <h3 className='font-bold'>{note.title}</h3>
                  <p className='font-sm'>{note.content}</p>
                </div>
                <button
                  onClick={() => deleteNote(note.id)}
                  className='bg-red-500 px-3 text-white rounded'
                >
                  X
                </button>
                <button
                  onClick={() =>
                    setForm({
                      title: note.title,
                      content: note.content,
                      id: note.id,
                    })
                  }
                  className='bg-blue-500 px-3 text-white rounded'
                >
                  Update
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const notes = await prisma.note.findMany({
    select: {
      title: true,
      id: true,
      content: true,
    },
  });
  notes.sort((a, b) => {
    return a.id < b.id ? -1 : 1;
  });
  return {
    props: {
      notes,
    },
  };
};
