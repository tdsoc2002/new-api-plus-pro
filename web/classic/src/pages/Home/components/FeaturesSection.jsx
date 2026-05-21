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
import { IconVideo, IconImage, IconEdit, IconUserGroup } from '@douyinfe/semi-icons';

export const FeaturesSection = () => {
  const { t } = useTranslation();
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const features = [
    {
      icon: IconVideo,
      title: t('AI 视频生成'),
      subtitle: 'Runway · Pika · Sora',
      description: t('文字生成视频、图片生成视频、视频编辑，专业级视频创作工具'),
      gradient: 'from-purple-500 to-pink-500',
      details: [
        t('文生视频：输入脚本，自动生成分镜'),
        t('图生视频：静态图片转动态视频'),
        t('视频编辑：AI 智能剪辑和特效'),
        t('支持 4K 输出，电影级画质'),
      ],
    },
    {
      icon: IconImage,
      title: t('AI 图片创作'),
      subtitle: 'DALL-E · Midjourney · SD',
      description: t('文生图、图生图、风格迁移，无限创意可能'),
      gradient: 'from-pink-500 to-rose-500',
      details: [
        t('文生图：描述即可生成高质量图片'),
        t('图生图：参考图片生成变体'),
        t('风格迁移：一键应用艺术风格'),
        t('批量生成：提升创作效率'),
      ],
    },
    {
      icon: IconEdit,
      title: t('画布协作'),
      subtitle: t('团队创意工作台'),
      description: t('实时协作画布，脑暴、设计、评审一站完成'),
      gradient: 'from-blue-500 to-cyan-500',
      details: [
        t('实时协作：多人同时编辑'),
        t('创意脑暴：思维导图和白板'),
        t('资产管理：统一管理创作素材'),
        t('版本控制：随时回溯历史版本'),
      ],
    },
    {
      icon: IconUserGroup,
      title: t('企业级管理'),
      subtitle: t('成本 · 权限 · 审计'),
      description: t('透明计费、团队管理、完整审计日志'),
      gradient: 'from-cyan-500 to-teal-500',
      details: [
        t('成本透明：每笔消费清晰可查'),
        t('预算控制：设置上限防止超支'),
        t('权限管理：细粒度角色控制'),
        t('审计日志：完整操作记录'),
      ],
    },
  ];

  return (
    <div className='py-20 px-4' style={{ background: '#0f172a' }}>
      <div className='max-w-7xl mx-auto'>
        {/* 标题 */}
        <div className='text-center mb-16'>
          <h2 className='text-4xl md:text-5xl font-bold mb-4' style={{ color: '#ffffff' }}>
            {t('强大的创作能力')}
          </h2>
          <p className='text-xl' style={{ color: '#9ca3af' }}>
            {t('一个平台，满足影视创作全流程需求')}
          </p>
        </div>

        {/* 功能卡片 */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isHovered = hoveredIndex === index;

            return (
              <div
                key={index}
                className='group relative p-8 rounded-3xl transition-all duration-500 cursor-pointer'
                style={{
                  background: isHovered
                    ? 'rgba(139, 92, 246, 0.1)'
                    : 'rgba(30, 41, 59, 0.5)',
                  border: isHovered
                    ? '1px solid rgba(139, 92, 246, 0.3)'
                    : '1px solid rgba(71, 85, 105, 0.3)',
                  backdropFilter: 'blur(10px)',
                  transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* 渐变光效 */}
                {isHovered && (
                  <div
                    className='absolute inset-0 rounded-3xl opacity-20 blur-xl transition-opacity duration-500'
                    style={{
                      background: `linear-gradient(135deg, var(--semi-color-${feature.gradient.split('-')[1]}-5), var(--semi-color-${feature.gradient.split('-')[3]}-5))`,
                    }}
                  />
                )}

                <div className='relative z-10'>
                  {/* 图标 */}
                  <div
                    className='w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500'
                    style={{
                      background: `linear-gradient(135deg, ${isHovered ? 'rgba(139, 92, 246, 0.2)' : 'rgba(71, 85, 105, 0.2)'})`,
                      transform: isHovered ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)',
                    }}
                  >
                    <Icon
                      size='extra-large'
                      style={{
                        color: isHovered ? '#a78bfa' : '#94a3b8',
                      }}
                    />
                  </div>

                  {/* 标题 */}
                  <h3 className='text-2xl font-bold mb-2' style={{ color: '#ffffff' }}>
                    {feature.title}
                  </h3>
                  <p className='text-sm mb-4 font-medium' style={{ color: '#a78bfa' }}>
                    {feature.subtitle}
                  </p>
                  <p className='mb-6 leading-relaxed' style={{ color: '#9ca3af' }}>
                    {feature.description}
                  </p>

                  {/* 详细功能列表 */}
                  <div
                    className='space-y-3 overflow-hidden transition-all duration-500'
                    style={{
                      maxHeight: isHovered ? '300px' : '0',
                      opacity: isHovered ? 1 : 0,
                    }}
                  >
                    {feature.details.map((detail, i) => (
                      <div
                        key={i}
                        className='flex items-start gap-3'
                        style={{
                          transform: isHovered
                            ? 'translateX(0)'
                            : 'translateX(-20px)',
                          transition: `all 0.5s ${i * 0.1}s`,
                        }}
                      >
                        <div className='w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 flex-shrink-0' />
                        <span className='text-sm' style={{ color: '#d1d5db' }}>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
