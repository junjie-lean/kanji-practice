import Image from 'next/image';
import { Inter } from 'next/font/google';
import { Button } from '@nextui-org/react';
import { useRouter } from 'next/router';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  const router = useRouter();
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}>
      <div className='mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-6 lg:text-left'>
        <Button className='w-[100px]' color='primary' onClick={() => router.push('/')}>
          home
        </Button>

        <Button className='w-[100px]' color='success' onClick={() => router.push('/practice')}>
          practice
        </Button>

        <Button className='w-[100px]' color='primary' onClick={() => router.push('/about')}>
          about
        </Button>

        <Button className='w-[100px]' color='primary' onClick={() => router.push('/user/321')}>
          user
        </Button>
      </div>
    </main>
  );
}
