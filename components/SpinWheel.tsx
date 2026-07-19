'use client';

import { useEffect, useRef, useState } from 'react';

interface SpinWheelProps {
  students: string[];
  onSpin: () => void;
  isSpinning: boolean;
  onSpinComplete: (winners: [string, string]) => void;
}

export function SpinWheel({
  students,
  onSpin,
  isSpinning,
  onSpinComplete,
}: SpinWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Menggunakan state hanya untuk memicu render ulang canvas saat posisi berubah
  const [rotation, setRotation] = useState(0);
  
  // Menyimpan posisi rotasi presisi di dalam ref agar animasi requestAnimationFrame stabil
  const currentRotationRef = useRef(0);
  const animationRef = useRef<number>(0);

  const COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#A8E6CF',
  ];

  const drawWheel = (ctx: CanvasRenderingContext2D, currentRotation: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (students.length === 0) {
      ctx.fillStyle = '#e0e0e0';
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#666';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('No Students', centerX, centerY);
      return;
    }

    const segmentAngle = (Math.PI * 2) / students.length;

    students.forEach((student, index) => {
      // Mengubah sudut rotasi dari derajat ke radian secara konsisten
      const startAngle = index * segmentAngle + (currentRotation * Math.PI) / 180;
      const endAngle = startAngle + segmentAngle;

      ctx.fillStyle = COLORS[index % COLORS.length];
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.lineTo(centerX, centerY);
      ctx.fill();

      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.lineTo(centerX, centerY);
      ctx.stroke();

      const textAngle = startAngle + segmentAngle / 2;
      const textX = centerX + Math.cos(textAngle) * (radius * 0.7);
      const textY = centerY + Math.sin(textAngle) * (radius * 0.7);

      ctx.save();
      ctx.translate(textX, textY);
      ctx.rotate(textAngle + Math.PI / 2);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const maxWidth = radius * 0.4;
      const words = student.split(' ');
      let line = '';
      const lines: string[] = [];

      words.forEach((word) => {
        const testLine = line + (line ? ' ' : '') + word;
        if (ctx.measureText(testLine).width > maxWidth) {
          if (line) lines.push(line);
          line = word;
        } else {
          line = testLine;
        }
      });
      if (line) lines.push(line);

      const lineHeight = 14;
      const startY = -(lines.length - 1) * (lineHeight / 2);

      lines.forEach((textLine, i) => {
        ctx.fillText(textLine, 0, startY + i * lineHeight);
      });

      ctx.restore();
    });

    // Center Circle
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Top Pointer Indicator
    ctx.fillStyle = '#FF6B6B';
    ctx.beginPath();
    ctx.moveTo(centerX, 10);
    ctx.lineTo(centerX - 15, 35);
    ctx.lineTo(centerX + 15, 35);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const animate = (finalRotation: number) => {
    const startRotation = currentRotationRef.current;
    let currentFrame = 0;
    const totalFrames = 150; // Ditambah sedikit frame agar transisi berhentinya lebih smooth

    const frame = () => {
      currentFrame++;
      const progress = currentFrame / totalFrames;
      // Easing Cubic Out untuk efek rem putaran yang natural
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const newRotation = startRotation + (finalRotation - startRotation) * easeProgress;
      
      // Update ref dan state secara beriringan
      currentRotationRef.current = newRotation % 360;
      setRotation(newRotation % 360);

      if (currentFrame < totalFrames) {
        animationRef.current = requestAnimationFrame(frame);
      } else {
        currentRotationRef.current = finalRotation % 360;
        setRotation(finalRotation % 360);
        
        // Ambil pemenang berdasarkan posisi rotasi akhir
        const winners = getWinners(finalRotation);
        onSpinComplete(winners);
      }
    };

    animationRef.current = requestAnimationFrame(frame);
  };

  const getWinners = (currentRotation: number): [string, string] => {
    if (students.length === 0) return ['', ''];
    if (students.length === 1) return [students[0], students[0]];

    // Membalikkan arah derajat karena putaran canvas searah jarum jam (clock-wise)
    const normalizedRotation = (360 - (currentRotation % 360)) % 360;
    const segmentAngle = 360 / students.length;

    // Menghitung indeks murid pertama tepat di bawah jarum pointer atas (top center)
    const index1 = Math.floor(normalizedRotation / segmentAngle) % students.length;
    
    // Menghitung indeks murid kedua yang berseberangan 180 derajat
    const index2 = (index1 + Math.floor(students.length / 2)) % students.length;

    return [students[index1], students[index2]];
  };

  const handleSpin = () => {
    if (isSpinning || students.length === 0) return;

    onSpin(); // Kunci status tombol menjadi spinning di parent component

    const spinDegrees = 1440 + Math.random() * 360; // Minimal 4 putaran penuh
    const finalRotation = currentRotationRef.current + spinDegrees;

    animate(finalRotation);
  };

  // Render ulang roda setiap ada pergeseran rotasi atau perubahan daftar nama murid
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawWheel(ctx, rotation);
  }, [rotation, students]);

  // Bersihkan sisa animasi memori saat komponen dilepas (unmounted)
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="border-4 border-primary rounded-full shadow-lg bg-card"
        />
      </div>
      <button
        onClick={handleSpin}
        disabled={isSpinning || students.length === 0}
        className="px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all select-none"
      >
        {students.length === 0 ? 'No Students' : isSpinning ? 'Spinning...' : 'SPIN!'}
      </button>
      <div className="text-center text-sm text-muted-foreground font-medium">
        {students.length} students remaining
      </div>
    </div>
  );
}