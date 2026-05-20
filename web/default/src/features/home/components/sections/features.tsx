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
import { Image as ImageIcon, Video, MessageSquare, Wallet, BarChart3, Shield } from 'lucide-react'

interface FeaturesProps {
  className?: string
}

export function Features(_props: FeaturesProps) {
  const features = [
    {
      icon: Video,
      title: 'AI 视频生成',
      description: '集成 Runway、Pika、Sora 等顶级模型，从文字到视频，从图片到动画，专业级视频创作',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: ImageIcon,
      title: 'AI 图片创作',
      description: '支持 DALL-E、Midjourney、Stable Diffusion，文生图、图生图、风格迁移，创意无限',
      gradient: 'from-pink-500 to-rose-500',
    },
    {
      icon: MessageSquare,
      title: '智能 AI 对话',
      description: 'GPT-4、Claude、Gemini 等大语言模型，写脚本、改文案、提供灵感，创作好帮手',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Wallet,
      title: '统一计费',
      description: '一个账户管理所有 AI 服务，告别多平台充值，按需付费，灵活充值，企业可月结',
      gradient: 'from-cyan-500 to-teal-500',
    },
    {
      icon: BarChart3,
      title: '消费透明',
      description: '每笔花费清晰可查，按模型、按时间、按项目统计，成本一目了然，预算心中有数',
      gradient: 'from-teal-500 to-green-500',
    },
    {
      icon: Shield,
      title: '成本可控',
      description: '设置预算上限防止超支，团队额度分配，企业级权限管理，完整审计日志',
      gradient: 'from-green-500 to-emerald-500',
    },
  ]

  return (
    <section className='relative px-6 py-24 md:py-32'>
      <div className='mx-auto max-w-7xl'>
        {/* 标题 */}
        <div className='mb-16 text-center'>
          <h2 className='mb-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 md:text-4xl'>
            创作能力 + 管理能力
          </h2>
          <p className='mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400'>
            强大的 AI 创作工具，配合透明的计费管理
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
