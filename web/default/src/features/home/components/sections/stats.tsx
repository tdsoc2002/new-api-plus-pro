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

interface StatsProps {
  className?: string
}

export function Stats(_props: StatsProps) {
  const stats = [
    { value: '40+', label: 'AI 模型' },
    { value: '10万+', label: '活跃用户' },
    { value: '500万+', label: '作品生成' },
    { value: '99.9%', label: '服务可用性' },
  ]

  return (
    <section className='border-y border-gray-200 bg-gray-50 px-6 py-16 dark:border-gray-800 dark:bg-gray-900/50'>
      <div className='mx-auto max-w-7xl'>
        <div className='grid grid-cols-2 gap-8 md:grid-cols-4'>
          {stats.map((stat, index) => (
            <div key={index} className='text-center'>
              <div className='mb-2 text-4xl font-bold text-gray-900 dark:text-gray-100 md:text-5xl'>
                {stat.value}
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-400'>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
