// サーバーサイドでの処理
//"use client";

export default function Page({ params }: { params: { name: string } }) {
    console.log(params.name);

    // user情報を取得する

    //const res = await fetch(`http://localhost:3001/users/${params.name}`);

    // サーバーサイドでの処理なのでhttp://localhost:3001は使えない
    // そのため、http://backend:3000を使う
    const res = fetch("http://backend:3000/users/test1", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
      })
      .then((res) => res.json())
      .then((data) => {

          console.log("data: ", data);
          return data;
      })
      .catch((error) => {

          console.log(error);
      });

    console.log(res);
    
  return (
    <div>
      <h1>Age</h1>
      <p>Age: 20</p>
    </div>
  );
}