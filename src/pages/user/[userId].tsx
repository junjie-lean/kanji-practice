'use client';

import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function UserId() {
  const router = useRouter();
  const { query } = router;

  const [userId, setUserId] = useState<Number | String | null>(query!.userId as String);

  useEffect(() => {
    console.log('userId is:', userId);
    console.log('query is:', query);
    const target: HTMLDivElement = document.querySelector('#user')!;
    target.style.color = 'gray';
    setUserId(query.userId as string)
  }, []);

  return (
    <div id='user' className='flex min-h-screen  justify-center items-center'>
      userId is :<span>{userId as String}</span>
    </div>
  );
}
