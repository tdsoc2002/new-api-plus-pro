/*
Copyright (C) 2023-2026 QuantumNous

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
import { Image as ImageIcon, Video, Wand2, Zap, Shield, Code } from 'lucide-react'

interface FeaturesProps {
  className?: string
}

export function Features(_props: FeaturesProps) {
  const features = [
    {
      icon: ImageIcon,
      title: 'AI 图片生成',
      description: '支持 DALL-E、Midjourney、Stable Diffusion 等主流模型，文生图、图生图一应俱全',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Video,
      title: 'AI 视频生成',
      description: '集成 Runway、Pika、Sora 等视频生成模型，轻松创作专业级视频内容',
      gradient: 'from-pink-500 to-rose-500',
    },
    {
      icon: Wand2,
      title: '智能优化',
      description: '自动优化提示词，智能调整参数，让每一次生成都达到最佳效果',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Zap,
      title: '极速响应',
      description: '分布式架构，智能负载均衡，确保每个请求都能快速响应',
      gradient: 'from-cyan-500 to-teal-500',
    },
    {
      icon: Shield,
      title: '安全可靠',
      description: '企业级安全保障，数据加密传输，完善的权限管理和审计日志',
      gradient: 'from-teal-500 to-green-500',
    },
    {
      icon: Code,
      title: '简单易用',
      description: '统一的 API 接口，完善的文档和示例，5 分钟即可完成集成',
      gradient: 'from-green-500 to-emerald-500',
    },
  ]

  return (
    <section className='relative px-6 py-24 md:py-32'>
      <div className='mx-auto max-w-7xl'>
        {/* 标题 */}
        <div className='mb-16 text-center'>
          <h2 className='mb-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 md:text-4xl'>
            强大的功能特性
          </h2>
          <p className='mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400'>
            一站式 AI 创作平台，满足您的所有需求
          </p>
        </div>

        {/* 特性网格 */}
        <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
          {features.map((feature, index) => (
            <div
              key={index}
              className='group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 transition-all hover:shadow-xl dark:border-gray-800 dark:bg-gray-900'
            >
              {/* 渐变背景 */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity group-hover:opacity-5`}
              />

              {/* 图标 */}
              <div
                className={`relative mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient}`}
              >
                <feature.icon className='h-6 w-6 text-white' />
              </div>

              {/* 标题 */}
              <h3 className='relative mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100'>
                {feature.title}
              </h3>

              {/* 描述 */}
              <p className='relative text-gray-600 dark:text-gray-400'>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
