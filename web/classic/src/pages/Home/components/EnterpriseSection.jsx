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
import { useTranslation } from 'react-i18next';
import { IconCheckCircleStroked } from '@douyinfe/semi-icons';

export const EnterpriseSection = () => {
  const { t } = useTranslation();

  const features = [
    {
      title: t('成本透明可控'),
      items: [
        t('每笔消费清晰可查，按模型、时间、项目统计'),
        t('设置预算上限，防止意外超支'),
        t('团队额度分配，灵活管理成本'),
        t('月度账单自动生成，支持导出'),
      ],
    },
    {
      title: t('团队协作管理'),
      items: [
        t('多角色权限控制，细粒度管理'),
        t('项目空间隔离，数据安全可靠'),
        t('成员使用统计，了解团队效率'),
        t('审批流程配置，规范创作流程'),
      ],
    },
    {
      title: t('企业级安全'),
      items: [
        t('完整审计日志，操作可追溯'),
        t('数据加密传输，符合安全标准'),
        t('SSO 单点登录，简化身份管理'),
        t('私有化部署支持，数据完全掌控'),
      ],
    },
  ];

  return (
    <div className='py-20 px-4' style={{ background: '#0f172a' }}>
      <div className='max-w-7xl mx-auto'>
        {/* 标题 */}
        <div className='text-center mb-16'>
          <h2 className='text-4xl md:text-5xl font-bold mb-4' style={{ color: '#ffffff' }}>
            {t('企业级管理能力')}
          </h2>
          <p className='text-xl' style={{ color: '#9ca3af' }}>
            {t('为 MCN 和影视公司量身打造的管理功能')}
          </p>
        </div>

        {/* 功能列表 */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-16'>
          {features.map((feature, index) => (
            <div
              key={index}
              className='p-8 rounded-3xl'
              style={{
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <h3 className='text-2xl font-bold mb-6' style={{ color: '#ffffff' }}>
                {feature.title}
              </h3>
              <ul className='space-y-4'>
                {feature.items.map((item, i) => (
                  <li key={i} className='flex items-start gap-3'>
                    <IconCheckCircleStroked
                      size='large'
                      style={{ color: '#8b5cf6', flexShrink: 0, marginTop: 2 }}
                    />
                    <span className='leading-relaxed' style={{ color: '#d1d5db' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 数据可视化示例 */}
        <div
          className='p-8 rounded-3xl'
          style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(71, 85, 105, 0.3)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <h3 className='text-2xl font-bold mb-8 text-center' style={{ color: '#ffffff' }}>
            {t('实时数据监控')}
          </h3>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
            {[
              { label: t('本月消费'), value: '¥12,580', change: '+8.2%', up: true },
              { label: t('生成次数'), value: '45,230', change: '+15.3%', up: true },
              { label: t('团队成员'), value: '28', change: '+3', up: true },
              { label: t('平均成本'), value: '¥0.28', change: '-12.5%', up: false },
            ].map((stat, index) => (
              <div
                key={index}
                className='p-6 rounded-2xl text-center'
                style={{
                  background: 'rgba(139, 92, 246, 0.05)',
                  border: '1px solid rgba(139, 92, 246, 0.1)',
                }}
              >
                <div className='text-sm mb-2' style={{ color: '#9ca3af' }}>{stat.label}</div>
                <div className='text-3xl font-bold mb-2' style={{ color: '#ffffff' }}>
                  {stat.value}
                </div>
                <div
                  className='text-sm font-medium'
                  style={{ color: stat.up ? '#10b981' : '#f59e0b' }}
                >
                  {stat.change}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
