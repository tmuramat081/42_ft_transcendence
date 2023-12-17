"use client"
import React, { useEffect, useRef } from 'react';

const PADDLE_SPEED = 5;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;

type Ball = {
  x: number,
  y: number,
  speedX: number,
  speedY: number,
};

type PongDemoProps = {
  title: string,
  width: number,
  height: number,
};

type KeyState = {
  ArrowUp: boolean,
  ArrowDown: boolean;
};

export default function PongDemo({ title, width, height }: PongDemoProps) {
  // canvas要素に対する参照
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // ボール位置の参照
  const ballRef = useRef<Ball>({ x: 0, y: 0, speedX: 0, speedY: 0 });
  // プレイヤー位置の参照
  const playerPaddleYRef = useRef<number>(0);
  // 相手位置の参照
  const computerPaddleYRef = useRef<number>(0);
  // キー入力の参照
  const keyStateRef = useRef<KeyState>({ ArrowUp: false, ArrowDown: false });

  // ゲーム状態の初期化
  const resetGame = (ctx: CanvasRenderingContext2D) => {
    ballRef.current.x = width / 2;
    ballRef.current.y = height / 2;
    ballRef.current.speedX = 5;
    ballRef.current.speedY = 5;
    playerPaddleYRef.current = height / 4;
    computerPaddleYRef.current = (ctx.canvas.height - PADDLE_WIDTH) / 2;
  };

  const drawCanvas = (ctx: CanvasRenderingContext2D) => {
    // パドルの描画
    function drawPaddle(x: number, y: number) {
      ctx.fillStyle = 'black';
      ctx.fillRect(x, y, PADDLE_WIDTH, PADDLE_HEIGHT);
    }

    // ボールの描画
    function drawBall(x: number, y: number) {
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fillStyle = 'black';
      ctx.fill();
      ctx.closePath();
    }

    // キーの入力状態に応じてプレーヤーのパドル位置を更新
    function updatePaddlePosition() {
      if (keyStateRef.current.ArrowUp) {
        playerPaddleYRef.current = Math.max(playerPaddleYRef.current - PADDLE_SPEED, 0);
      }
      if (keyStateRef.current.ArrowDown) {
        playerPaddleYRef.current = Math.min(playerPaddleYRef.current + PADDLE_SPEED, height - PADDLE_HEIGHT);
      }
    }

    // パドルの衝突判定
    function checkPaddleCollision() {
      if (
        ballRef.current.x < 20 && ballRef.current.x > 10 &&
        ballRef.current.y > playerPaddleYRef.current && 
        ballRef.current.y < playerPaddleYRef.current + PADDLE_HEIGHT)
      {
        ballRef.current.speedX = -ballRef.current.speedX;
      }
    }

    function draw() {
      // Canvasをクリア
      ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      // パドルとボールを描画
      drawPaddle(10, playerPaddleYRef.current);
      drawPaddle(ctx.canvas.width - 20, computerPaddleYRef.current);
      drawBall(ballRef.current.x, ballRef.current.y);

      // パドル位置を再計算
      updatePaddlePosition();

      // 衝突判定
      checkPaddleCollision();

      // ボールの位置を再計算
      ballRef.current.x += ballRef.current.speedX;
      ballRef.current.y += ballRef.current.speedY;

      // ボールが上下の壁に当たった場合
      if (ballRef.current.y < 0 || ballRef.current.y > ctx.canvas.height) {
        ballRef.current.speedY = -ballRef.current.speedY;
      }

      // ボールがコンピュータのパドルに当たった場合
      if (ballRef.current.x > ctx.canvas.width - 20 &&
        ballRef.current.x < ctx.canvas.width - 10 &&
        ballRef.current.y > computerPaddleYRef.current &&
        ballRef.current.y < computerPaddleYRef.current + PADDLE_HEIGHT) {
        ballRef.current.speedX = -ballRef.current.speedX;
      }

      // コンピュータのパドルを制御
      const computerPaddleCenter = computerPaddleYRef.current + PADDLE_HEIGHT / 2;
      if (computerPaddleCenter < ballRef.current.y - 35) {
        computerPaddleYRef.current += 5;
      } else if (computerPaddleCenter > ballRef.current.y + 35) {
        computerPaddleYRef.current -= 5;
      }
      requestAnimationFrame(draw);
    }
    // ゲームループを開始
    draw();
  };

  // キー入力時の更新処理
  useEffect(() => {
    // キー押下時のイベントハンドラ
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        keyStateRef.current[e.key] = true;
      }
      if (e.key === ' ') {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
          resetGame(ctx);
        }
      }
    };
  
    // キー開放時のイベントハンドラ
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        keyStateRef.current[e.key] = false;
      }
    };
    
    // イベントリスナーをセット
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // クリーンアップ
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // canvas描画
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');

    if (ctx) {
      resetGame(ctx);
      drawCanvas(ctx);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <h1>Pong! demo</h1>
      <div>
        <p>MOVE: Arrow-Up/Arrow-Down</p>
        <p>RESET: Space</p>
      </div>
      <canvas
        ref={canvasRef}
        id={title}
        width={width}
        height={height}
        style={{ border: '1px solid black' }}
      ></canvas>
    </>
  );
}