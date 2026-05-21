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

import React from 'react';
import { Button } from '@douyinfe/semi-ui';
import { IconPlay, IconFile } from '@douyinfe/semi-icons';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const HeroSection = ({ serverAddress, isMobile, docsLink }) => {
  const { t } = useTranslation();

  return (
    <div className='relative min-h-screen flex items-center justify-center overflow-hidden' style={{ background: 'linear-gradient(135deg, #111827 0%, #1e1b4b 100%)' }}>
      {/* 纯 CSS 渐变光效 - 性能优化 */}
      <div className='absolute inset-0 z-0'>
        <div
          className='absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20'
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
            animation: 'pulse 4s ease-in-out infinite'
          }}
        />
        <div
          className='absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20'
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
            animation: 'pulse 4s ease-in-out infinite 2s'
          }}
        />
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
