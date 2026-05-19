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
import { Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CTAProps {
  className?: string
  isAuthenticated?: boolean
}

export function CTA(props: CTAProps) {
  if (props.isAuthenticated) {
    return null
  }

  return (
    <section className='relative z-10 overflow-hidden px-6 py-24 md:py-32'>
      {/* 渐变背景 */}
      <div
        aria-hidden
        className='absolute inset-0 -z-10'
        style={{
          background: [
            'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(120, 119, 198, 0.2), transparent 70%)',
            'radial-gradient(ellipse 60% 50% at 30% 50%, rgba(189, 147, 249, 0.15), transparent 70%)',
          ].join(', '),
        }}
      />

      <div className='mx-auto max-w-4xl text-center'>
        {/* 主标题 */}
        <h2 className='mb-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 md:text-5xl'>
          准备好开启
          <br />
          <span className='bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
            AI 创作之旅了吗？
          </span>
        </h2>

        {/* 副标题 */}
        <p className='mx-auto mb-10 max-w-2xl text-lg text-gray-600 dark:text-gray-400'>
          立即注册，获取 API 密钥，开始使用顶级 AI 模型生成图片和视频
        </p>

        {/* CTA 按钮 */}
        <div className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
          <Button asChild size='lg' className='group h-12 px-8 text-base'>
            <Link to='/login'>
              <Sparkles className='mr-2 h-5 w-5' />
              立即开始
              <ArrowRight className='ml-2 h-5 w-5 transition-transform group-hover:translate-x-1' />
            </Link>
          </Button>
          <Button asChild variant='outline' size='lg' className='h-12 px-8 text-base'>
            <Link to='/pricing'>
              查看定价
            </Link>
          </Button>
        </div>

        {/* 信任标记 */}
        <div className='mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500 dark:text-gray-500'>
          <div className='flex items-center gap-2'>
            <svg className='h-5 w-5 text-green-500' fill='currentColor' viewBox='0 0 20 20'>
              <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
            </svg>
            <span>无需信用卡</span>
          </div>
          <div className='flex items-center gap-2'>
            <svg className='h-5 w-5 text-green-500' fill='currentColor' viewBox='0 0 20 20'>
              <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
            </svg>
            <span>即刻使用</span>
          </div>
          <div className='flex items-center gap-2'>
            <svg className='h-5 w-5 text-green-500' fill='currentColor' viewBox='0 0 20 20'>
              <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
            </svg>
            <span>随时取消</span>
          </div>
        </div>
      </div>
    </section>
  )
}
