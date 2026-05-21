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

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tag } from '@douyinfe/semi-ui';

export const ShowcaseSection = () => {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState('all');

  // 示例作品数据（使用占位符，避免外链加载慢）
  const showcaseItems = [
    {
      id: 1,
      type: 'video',
      title: t('科幻短片 - 未来城市'),
      thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%231e293b" width="800" height="600"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="48" fill="%238b5cf6"%3E%E8%A7%86%E9%A2%91%E7%A4%BA%E4%BE%8B%3C/text%3E%3C/svg%3E',
      tags: [t('视频'), 'Runway', t('科幻')],
      creator: 'MCN Studio A',
    },
    {
      id: 2,
      type: 'image',
      title: t('商业海报 - 产品发布'),
      thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%231e293b" width="800" height="600"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="48" fill="%23ec4899"%3E%E5%9B%BE%E7%89%87%E7%A4%BA%E4%BE%8B%3C/text%3E%3C/svg%3E',
      tags: [t('图片'), 'Midjourney', t('商业')],
      creator: t('影视公司 B'),
    },
    {
      id: 3,
      type: 'video',
      title: t('广告片 - 汽车宣传'),
      thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%231e293b" width="800" height="600"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="48" fill="%238b5cf6"%3E%E8%A7%86%E9%A2%91%E7%A4%BA%E4%BE%8B%3C/text%3E%3C/svg%3E',
      tags: [t('视频'), 'Pika', t('广告')],
      creator: 'Creative Team C',
    },
    {
      id: 4,
      type: 'image',
      title: t('概念设计 - 角色原画'),
      thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%231e293b" width="800" height="600"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="48" fill="%23ec4899"%3E%E5%9B%BE%E7%89%87%E7%A4%BA%E4%BE%8B%3C/text%3E%3C/svg%3E',
      tags: [t('图片'), 'DALL-E', t('概念设计')],
      creator: t('游戏工作室 D'),
    },
    {
      id: 5,
      type: 'video',
      title: t('纪录片 - 自然风光'),
      thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%231e293b" width="800" height="600"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="48" fill="%238b5cf6"%3E%E8%A7%86%E9%A2%91%E7%A4%BA%E4%BE%8B%3C/text%3E%3C/svg%3E',
      tags: [t('视频'), 'Sora', t('纪录片')],
      creator: t('纪录片团队 E'),
    },
    {
      id: 6,
      type: 'image',
      title: t('时尚摄影 - 杂志封面'),
      thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%231e293b" width="800" height="600"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="48" fill="%23ec4899"%3E%E5%9B%BE%E7%89%87%E7%A4%BA%E4%BE%8B%3C/text%3E%3C/svg%3E',
      tags: [t('图片'), 'Stable Diffusion', t('时尚')],
      creator: t('时尚杂志 F'),
    },
  ];

  const filters = [
    { key: 'all', label: t('全部作品') },
    { key: 'video', label: t('视频') },
    { key: 'image', label: t('图片') },
  ];

  const filteredItems =
    activeFilter === 'all'
      ? showcaseItems
      : showcaseItems.filter((item) => item.type === activeFilter);

  return (
    <div className='py-20 px-4' style={{ background: '#1e293b' }}>
      <div className='max-w-7xl mx-auto'>
        {/* 标题 */}
        <div className='text-center mb-12'>
          <h2 className='text-4xl md:text-5xl font-bold mb-4' style={{ color: '#ffffff' }}>
            {t('创作者作品展示')}
          </h2>
          <p className='text-xl mb-8' style={{ color: '#9ca3af' }}>
            {t('看看其他创作者用 AI 做出了什么')}
          </p>

          {/* 筛选标签 */}
          <div className='flex justify-center gap-3'>
            {filters.map((filter) => (
              <Tag
                key={filter.key}
                size='large'
                className='cursor-pointer transition-all duration-300'
                style={{
                  background:
                    activeFilter === filter.key
                      ? 'linear-gradient(135deg, #8b5cf6, #ec4899)'
                      : 'rgba(71, 85, 105, 0.3)',
                  border:
                    activeFilter === filter.key
                      ? '1px solid rgba(139, 92, 246, 0.5)'
                      : '1px solid rgba(71, 85, 105, 0.3)',
                  color: activeFilter === filter.key ? '#fff' : '#94a3b8',
                  padding: '8px 20px',
                  borderRadius: '20px',
                }}
                onClick={() => setActiveFilter(filter.key)}
              >
                {filter.label}
              </Tag>
            ))}
          </div>
        </div>

        {/* 作品网格 */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              className='group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-105'
              style={{
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                backdropFilter: 'blur(10px)',
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
              }}
            >
              {/* 缩略图 */}
              <div className='relative aspect-video overflow-hidden'>
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  loading='lazy'
                  className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
                />
                {/* 视频标识 */}
                {item.type === 'video' && (
                  <div className='absolute top-4 right-4 w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center'>
                    <svg
                      className='w-6 h-6 text-white'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path d='M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z' />
                    </svg>
                  </div>
                )}
                {/* 悬停遮罩 */}
                <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
              </div>

              {/* 信息区 */}
              <div className='p-6'>
                <h3 className='text-lg font-semibold mb-2 line-clamp-1' style={{ color: '#ffffff' }}>
                  {item.title}
                </h3>
                <p className='text-sm mb-3' style={{ color: '#9ca3af' }}>{item.creator}</p>
                <div className='flex flex-wrap gap-2'>
                  {item.tags.map((tag, i) => (
                    <Tag
                      key={i}
                      size='small'
                      style={{
                        background: 'rgba(139, 92, 246, 0.1)',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                        color: '#a78bfa',
                      }}
                    >
                      {tag}
                    </Tag>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 查看更多 */}
        <div className='text-center mt-12'>
          <button
            className='px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105'
            style={{
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              color: '#a78bfa',
            }}
          >
            {t('查看更多作品')} →
          </button>
        </div>
      </div>

      {/* 添加动画样式 */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
