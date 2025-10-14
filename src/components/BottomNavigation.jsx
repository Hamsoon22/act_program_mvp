import React from 'react';
import homeActIcon from '../home_act.svg';
import homeDisIcon from '../home_dis.svg';
import mypageActIcon from '../mypage_act.svg';
import mypageDisIcon from '../mypage_dis.svg';
import menuActIcon from '../menu_act.svg';
import menuDisIcon from '../menu_dis.svg';
import sirenIcon from '../siren.svg';

const BottomNavigation = ({ activeTab, onTabChange, onOpenMenu, onOpenProfile, showMenu, onCloseMenu }) => {
  const tabs = [
    {
      id: 'home',
      label: '홈',
      activeIcon: homeActIcon,
      inactiveIcon: homeDisIcon,
      onClick: () => {
        if (showMenu) {
          onCloseMenu();
        }
        onTabChange('home');
      }
    },
    {
      id: 'mypage',
      label: '프로필',
      activeIcon: mypageActIcon,
      inactiveIcon: mypageDisIcon,
      onClick: () => {
        if (showMenu) {
          onCloseMenu();
        }
        onOpenProfile();
      }
    },
    {
      id: 'menu',
      label: '전체메뉴',
      activeIcon: menuActIcon,
      inactiveIcon: menuDisIcon,
      onClick: onOpenMenu
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100]">
      {/* 플로팅 고객센터 버튼 */}
      <div className="absolute bottom-28 right-4">
        <button 
          onClick={() => window.open('https://forms.gle/Fwi6A7NQMg7N9DvM7', '_blank')}
          className="w-12 h-12 bg-blue-500 bg-opacity-90 rounded-full flex items-center justify-center shadow-lg hover:bg-opacity-100 transition-all"
        >
          {/* 사이렌 아이콘 */}
          <img src={sirenIcon} alt="사이렌" className="w-6 h-6" />
        </button>
      </div>

      {/* 하단 네비게이션 */}
      <div className="bg-white border-t border-gray-200 h-[100px]">
        <div className="flex justify-around items-center h-full px-4 max-w-full sm:max-w-3xl mx-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={tab.onClick}
              className="flex flex-col items-center justify-center min-w-0 flex-1 h-full pb-4"
            >
              <img
                src={
                  (tab.id === 'menu' && showMenu) || (activeTab === tab.id && !showMenu)
                    ? tab.activeIcon 
                    : tab.inactiveIcon
                }
                alt={tab.label}
                className="w-16 h-16"
              />
              <span
                className={`text-base -mt-2 ${
                  (tab.id === 'menu' && showMenu) || (activeTab === tab.id && !showMenu)
                    ? 'text-black font-medium'
                    : 'text-[#B5BEC7]'
                }`}
              >
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BottomNavigation;