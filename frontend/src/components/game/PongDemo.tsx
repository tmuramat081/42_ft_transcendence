"use client"
import React, { useEffect, useRef, useState } from 'react';

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

export default function PongDemo({ title, width, height }: PongDemoProps) {
  // canvas要素に対する参照
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // ボール位置の参照
  const ballRef = useRef({ x: width / 2, y: height / 2, speedX: 5, speedY: 5 });
  // プレイヤー位置の参照
  const playerPaddleYRef = useRef(height / 4);

  const drawCanvas = (ctx: CanvasRenderingContext2D) => {
    let paddleWidth = 10;
    let paddleHeight = 100;
    let computerPaddleY = (ctx.canvas.height - paddleHeight) / 2;

    function drawPaddle(x: number, y: number) {
      ctx.fillStyle = 'black';
      ctx.fillRect(x, y, paddleWidth, paddleHeight);
    }

    function drawBall(x: number, y: number) {
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fillStyle = 'black';
      ctx.fill();
      ctx.closePath();
    }

    function draw() {
      // Canvasをクリア
      ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      // パドルとボールを描画
      drawPaddle(10, playerPaddleYRef.current);
      drawPaddle(ctx.canvas.width - 20, computerPaddleY);
      drawBall(ballRef.current.x, ballRef.current.y);

      // ボールの位置を再計算
      ballRef.current.x += ballRef.current.speedX;
      ballRef.current.y += ballRef.current.speedY;

      // ボールが上下の壁に当たった場合
      if (ballRef.current.y < 0 || ballRef.current.y > ctx.canvas.height) {
        ballRef.current.speedY = -ballRef.current.speedY;
      }

      // ボールがコンピュータのパドルに当たった場合
      if (ballRef.current.x > ctx.canvas.width - 20 && ballRef.current.x < ctx.canvas.width - 10 && ballRef.current.y > computerPaddleY && ballRef.current.y < computerPaddleY + paddleHeight) {
        ballRef.current.speedX = -ballRef.current.speedX;
      }

      // コンピュータのパドルを制御
      const computerPaddleCenter = computerPaddleY + paddleHeight / 2;
      if (computerPaddleCenter < ballRef.current.y - 35) {
        computerPaddleY += 5;
      } else if (computerPaddleCenter > ballRef.current.y + 35) {
        computerPaddleY -= 5;
      }
      requestAnimationFrame(draw);
    }

    // ゲームループを開始
    draw();
  };

  
  // 更新処理
  useEffect(() => {
    // キー押下時のイベントハンドラ
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' && playerPaddleYRef.current > 0) {
        playerPaddleYRef.current -= 10;
      } else if (e.key === 'ArrowDown' && playerPaddleYRef.current < 400 - 100) {
        playerPaddleYRef.current += 10;
      }
    };

    // イベントリスナーを設定
    window.addEventListener('keydown', handleKeyDown);
    // クリーンアップ
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // canvas描画
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      drawCanvas(ctx);
    }
  }, []);

    
  return (
    <>
      <h1>Pong! demo</h1>
      <div>
        <p>Press Arrow-Up key and Arrow-Down key</p>
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