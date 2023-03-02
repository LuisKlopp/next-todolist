import { GetServerSideProps } from 'next';
import { ChangeEvent, useEffect, useState } from 'react';
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

  const onChange = <T extends HTMLInputElement | HTMLTextAreaElement>(
    e: ChangeEvent<T>
  ): void => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const refreshData = () => {
    router.replace(router.asPath);
  };

  async function createNote(data: FormData) {
    if (data.id) {
      await axios.put(`${baseUrl}/note/${data.id}`, { data }).then(() => {
        refreshData();
      });
      setForm({ title: '', content: '', id: '' });
      return;
    }
    await axios.post(`${baseUrl}/create`, { data }).then(() => {
      setForm({ title: '', content: '', id: '' });
      refreshData();
    });
  }

  async function deleteNote(id: string) {
    await axios.delete(`${baseUrl}/note/${id}`).then(() => {
      refreshData();
    });
  }

  return (
    <div>
      <h1 className='text-center font-bold text-2xl mt-4'>To-Do-List</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createNote(form);
        }}
        className='w-auto min-w-[25%] max-w-min mx-auto space-y-6 flex flex-col items-stretch mt-10'
      >
        <input
          type='text'
          placeholder='Title'
          name='title'
          value={form.title}
          onChange={onChange}
          className='border-2 rounded border-gray-600 p-1'
        />
        <textarea
          placeholder='Content'
          name='content'
          value={form.content}
          onChange={onChange}
          className='border-2 rounded border-gray-600 p-1'
        />
        <button type='submit' className='bg-gray-500 text-white rounded p-1'>
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
                  className='bg-red-700 px-3 text-white rounded'
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
                  className='bg-gray-500 px-3 ml-3 text-white rounded'
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
