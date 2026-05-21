/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import React, { useEffect, useRef } from 'react';
import { Button } from '@douyinfe/semi-ui';
import { IconPlay, IconFile } from '@douyinfe/semi-icons';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const HeroSection = ({ serverAddress, isMobile, docsLink }) => {
  const { t } = useTranslation();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // 粒子系统
    const particles = [];
    const particleCount = 100;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 2 + 1;
        this.opacity = Math.random() * 0.5 + 0.2;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${this.opacity})`;
        ctx.fill();
      }
    }

    // 初始化粒子
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // 动画循环
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 绘制渐变背景
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, 'rgba(17, 24, 39, 1)');
      gradient.addColorStop(1, 'rgba(30, 27, 75, 1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 更新和绘制粒子
      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      // 连接粒子
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.1 * (1 - distance / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    }

    animate();

    // 响应窗口大小变化
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className='relative min-h-screen flex items-center justify-center overflow-hidden'>
      {/* 3D 动态背景 */}
      <canvas
        ref={canvasRef}
        className='absolute inset-0 z-0'
        style={{ background: 'linear-gradient(135deg, #111827 0%, #1e1b4b 100%)' }}
      />

      {/* 渐变光效 */}
      <div className='absolute inset-0 z-0'>
        <div className='absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse' />
        <div className='absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse' style={{ animationDelay: '1s' }} />
      </div>

      {/* 内容区 */}
      <div className='relative z-10 max-w-6xl mx-auto px-4 py-20 text-center'>
        {/* 标签 */}
        <div className='inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm'>
          <span className='w-2 h-2 bg-purple-500 rounded-full animate-pulse' />
          <span className='text-sm text-purple-300 font-medium'>
            {t('为 MCN 和影视公司打造')}
          </span>
        </div>

        {/* 主标题 */}
        <h1 className='text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight'>
          <span className='bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent drop-shadow-lg'>
            {t('AI 创作工作室')}
          </span>
          <br />
          <span className='bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent drop-shadow-lg'>
            {t('为影视而生')}
          </span>
        </h1>

        {/* 副标题 */}
        <p className='text-xl md:text-2xl text-gray-100 mb-12 max-w-3xl mx-auto leading-relaxed font-medium'>
          {t('视频生成 · 图片创作 · 画布协作')}
          <br />
          <span className='text-purple-200'>{t('一站式 AI 创作平台，让创意无限延伸')}</span>
        </p>

        {/* CTA 按钮 */}
        <div className='flex flex-col sm:flex-row gap-4 justify-center items-center mb-16'>
          <Link to='/console'>
            <Button
              theme='solid'
              type='primary'
              size='large'
              className='!rounded-full px-8 py-3 text-lg font-semibold shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all'
              icon={<IconPlay />}
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                border: 'none',
              }}
            >
              {t('开始创作')}
            </Button>
          </Link>
          {docsLink && (
            <Button
              size='large'
              className='!rounded-full px-8 py-3 text-lg font-semibold backdrop-blur-sm'
              icon={<IconFile />}
              onClick={() => window.open(docsLink, '_blank')}
              style={{
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                color: '#fff',
              }}
            >
              {t('查看文档')}
            </Button>
          )}
        </div>

        {/* 统计数据 */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto'>
          {[
            { label: t('AI 模型'), value: '40+' },
            { label: t('企业客户'), value: '500+' },
            { label: t('月生成量'), value: '10M+' },
            { label: t('成本节省'), value: '60%' },
          ].map((stat, index) => (
            <div
              key={index}
              className='p-6 rounded-2xl backdrop-blur-sm'
              style={{
                background: 'rgba(139, 92, 246, 0.15)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
              }}
            >
              <div className='text-3xl md:text-4xl font-bold text-white mb-2'>
                {stat.value}
              </div>
              <div className='text-sm text-gray-200 font-medium'>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 底部渐变 */}
      <div className='absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent z-5' />
    </div>
  );
};
