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
import { UserPlus, Key, Sparkles } from 'lucide-react'

export function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: '注册账号',
      desc: '快速注册，无需信用卡，即刻开始使用',
      icon: UserPlus,
      color: 'from-purple-500 to-pink-500',
    },
    {
      num: '02',
      title: '获取密钥',
      desc: '在控制台创建 API 密钥，配置使用额度',
      icon: Key,
      color: 'from-pink-500 to-rose-500',
    },
    {
      num: '03',
      title: '开始创作',
      desc: '调用 API 接口，生成精美图片和视频',
      icon: Sparkles,
      color: 'from-rose-500 to-orange-500',
    },
  ]

  return (
    <section className='relative px-6 py-24 md:py-32'>
      <div className='mx-auto max-w-7xl'>
        {/* 标题 */}
        <div className='mb-16 text-center'>
          <h2 className='mb-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 md:text-4xl'>
            三步开始使用
          </h2>
          <p className='mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400'>
            简单快速，5 分钟即可完成集成
          </p>
        </div>

        {/* 步骤 */}
        <div className='grid gap-12 md:grid-cols-3'>
          {steps.map((step, index) => (
            <div key={index} className='relative flex flex-col items-center text-center'>
              {/* 连接线 */}
              {index < steps.length - 1 && (
                <div className='absolute top-12 left-1/2 hidden h-0.5 w-full bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-800 md:block' />
              )}

              {/* 图标 */}
              <div className='relative z-10 mb-6'>
                <div
                  className={`flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} shadow-lg`}
                >
                  <step.icon className='h-12 w-12 text-white' />
                </div>
                <div className='absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-gray-900 shadow-md dark:bg-gray-900 dark:text-gray-100'>
                  {step.num}
                </div>
              </div>

              {/* 标题 */}
              <h3 className='mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100'>
                {step.title}
              </h3>

              {/* 描述 */}
              <p className='max-w-xs text-gray-600 dark:text-gray-400'>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
