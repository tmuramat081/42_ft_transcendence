import {useState} from "react"
import {getServerSession} from "next-auth/react"
import {options} from "../../app/options"

// // 更新ページ サーバーサイドバージョン
// export default async function Form() {
//     const session = await getServerSession(options)
//     const user = session?.user

//     // const [userName, setUserName] = useState('');
//     // const [email, setEmail] = useState('');
//     // const [password, setPassword] = useState('');
//     // const [passwordConfirm, setPasswordConfirm] = useState('');
//     // const [file, setFile] = useState(null);
//     // const [twoFactorAuth, setTwoFactorAuth] = useState(false);
//     // const [qrCodeUrl, setQrCodeUrl] = useState('');
//     // const [code, setCode] = useState('');
//     // 

//     return (
        
//     )
// }

//import { useSession, signIn, signOut } from 'next-auth/react';

// export default  function Profile() {
//   const session  = getServerSession(options);
//   //const { data: session, status } = useSession();
//   const [name, setName] = useState(session?.user.name || '');
//   const [email, setEmail] = useState(session?.user.email || '');

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // ここにユーザー情報更新のAPIリクエストを追加
//     // 例: await fetch('/api/update-profile', { method: 'POST', body: JSON.stringify({ name, email }) });
//   };

// //   if (!session) {
// //     return (
// //       <>
// //         <h1>プロフィール</h1>
// //         <button onClick={() => signIn()}>サインイン</button>
// //       </>
// //     );
// //   }

//   return (
//     <>
//       <h1>プロフィール</h1>
//       <form onSubmit={handleSubmit}>
//         <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
//         <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
//         <button type="submit">更新</button>
//         <button onClick={() => signOut()}>サインアウト</button>
//       </form>
//     </>
//   );
// }


import { useSession, signIn, signOut } from "next-auth/react";

export default async function Profile() {
  //const { data: session } = useSession();
    const session = await getServerSession(options);

  if (session) {
    return (
      <>
        <h1>プロフィール</h1>
        <p>名前: {session.user.name}</p>
        <p>Email: {session.user.email}</p>
        <button onClick={() => signOut()}>サインアウト</button>
      </>
    );
  }
  return (
    <>
      <h1>プロフィール</h1>
      <button onClick={() => signIn()}>サインイン</button>
    </>
  );
}