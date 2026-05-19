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
import { Link } from '@tanstack/react-router'
import { Sparkles, Video, Image as ImageIcon, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeroProps {
  className?: string
  isAuthenticated?: boolean
}

export function Hero(props: HeroProps) {
  return (
    <section className='relative z-10 flex flex-col items-center overflow-hidden px-6 pt-32 pb-20 md:pt-40 md:pb-32'>
      {/* 动态渐变背景 */}
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 -z-10'
        style={{
          background: [
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(120, 119, 198, 0.3), transparent 50%)',
            'radial-gradient(ellipse 60% 50% at 80% 50%, rgba(189, 147, 249, 0.2), transparent 50%)',
          ].join(', '),
        }}
      />

      {/* 装饰性网格 */}
      <div
        aria-hidden
        className='absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,black_10%,transparent_100%)] bg-[size:4rem_4rem] opacity-[0.05]'
      />

      {/* 主标题区域 */}
      <div className='relative z-10 mx-auto max-w-5xl text-center'>
        {/* 标签 */}
        <div className='mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400'>
          <Sparkles className='h-4 w-4' />
          <span>AI 创作新纪元</span>
        </div>

        {/* 主标题 */}
        <h1 className='mb-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-600 bg-clip-text text-5xl font-bold leading-tight tracking-tight text-transparent dark:from-gray-100 dark:via-gray-300 dark:to-gray-500 md:text-7xl'>
          AI 图片与视频
          <br />
          <span className='bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
            一键生成
          </span>
        </h1>

        {/* 副标题 */}
        <p className='mx-auto mb-10 max-w-2xl text-lg text-gray-600 dark:text-gray-400 md:text-xl'>
          聚合顶级 AI 模型，提供统一 API 接口
          <br />
          让创意触手可及，让想象成为现实
        </p>

        {/* CTA 按钮 */}
        <div className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
          {props.isAuthenticated ? (
            <Button asChild size='lg' className='group h-12 px-8 text-base'>
              <Link to='/panel'>
                <Zap className='mr-2 h-5 w-5' />
                进入控制台
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild size='lg' className='group h-12 px-8 text-base'>
                <Link to='/login'>
                  <Sparkles className='mr-2 h-5 w-5' />
                  立即开始
                </Link>
              </Button>
              <Button asChild variant='outline' size='lg' className='h-12 px-8 text-base'>
                <Link to='/pricing'>
                  查看定价
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* 特性标签 */}
        <div className='mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400'>
          <div className='flex items-center gap-2'>
            <ImageIcon className='h-4 w-4 text-purple-600' />
            <span>文生图 / 图生图</span>
          </div>
          <div className='flex items-center gap-2'>
            <Video className='h-4 w-4 text-pink-600' />
            <span>文生视频 / 图生视频</span>
          </div>
          <div className='flex items-center gap-2'>
            <Zap className='h-4 w-4 text-blue-600' />
            <span>秒级响应</span>
          </div>
        </div>
      </div>
    </section>
  )
}
