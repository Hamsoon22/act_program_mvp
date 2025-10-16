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
    <>
      {/* CSS 스타일 추가 */}
      <style jsx>{`
        .bottom-nav-container {
          position: fixed !important;
          bottom: 0px !important;
          left: 0px !important;
          right: 0px !important;
          height: 95px !important;
          width: 100vw !important;
          z-index: 9999 !important;
          transform: translateZ(0) !important;
          will-change: transform !important;
          overflow: hidden !important;
          pointer-events: auto !important;
          -webkit-transform: translateZ(0) !important;
          -webkit-backface-visibility: hidden !important;
          backface-visibility: hidden !important;
          isolation: isolate !important;
        }
        .bottom-nav-inner {
          position: absolute !important;
          bottom: 0px !important;
          left: 0px !important;
          right: 0px !important;
          height: 95px !important;
          width: 100% !important;
          overflow: hidden !important;
          -webkit-transform: translateZ(0) !important;
          transform: translateZ(0) !important;
        }
        .bottom-nav-container * {
          -webkit-transform: translateZ(0) !important;
          transform: translateZ(0) !important;
        }
        body:has(.bottom-nav-container) {
          padding-bottom: 95px !important;
        }
        @media screen and (max-height: 500px) {
          .bottom-nav-container {
            height: 95px !important;
            bottom: 0px !important;
          }
        }
        @supports (-webkit-touch-callout: none) {
          .bottom-nav-container {
            position: fixed !important;
            bottom: 0px !important;
            height: 95px !important;
          }
        }
      `}</style>
      
      <div 
        className="bottom-nav-container bottom-nav-container-global z-[9999]" 
        style={{ 
          position: 'fixed !important',
          bottom: '0px !important',
          left: '0px !important',
          right: '0px !important',
          height: '95px !important',
          width: '100vw !important',
          overflowX: 'hidden !important',
          overflowY: 'hidden !important',
          zIndex: '9999 !important',
          transform: 'translateZ(0) !important',
          willChange: 'transform !important',
          WebkitTransform: 'translateZ(0) !important',
          pointerEvents: 'auto !important',
          WebkitBackfaceVisibility: 'hidden !important',
          backfaceVisibility: 'hidden !important',
          isolation: 'isolate !important'
        }}
      >
        {/* 플로팅 고객센터 버튼 */}
        <div style={{ position: 'absolute', bottom: '96px', right: '16px', zIndex: 10000 }}>
          <button 
            onClick={() => window.open('https://forms.gle/Fwi6A7NQMg7N9DvM7', '_blank')}
            className="w-12 h-12 bg-blue-500 bg-opacity-90 rounded-full flex items-center justify-center shadow-lg hover:bg-opacity-100 transition-all"
          >
            {/* 사이렌 아이콘 */}
            <img src={sirenIcon} alt="사이렌" className="w-6 h-6" />
          </button>
        </div>

        {/* 하단 네비게이션 */}
        <div 
          className="bottom-nav-inner bg-white border-t border-gray-200" 
          style={{ 
            height: '95px !important', 
            overflowX: 'hidden !important',
            overflowY: 'hidden !important',
            position: 'absolute !important',
            bottom: '0px !important',
            left: '0px !important',
            right: '0px !important',
            width: '100% !important',
            zIndex: '9999 !important'
          }}
        >
        <div 
          className="flex justify-around items-end h-full px-2" 
          style={{ 
            maxWidth: '100%',
            width: '100%',
            overflowX: 'hidden',
            paddingBottom: '16px'
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={tab.onClick}
              className="flex flex-col items-center justify-end min-w-0 flex-1 h-full"
              style={{ paddingTop: '4px' }}
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
    </>
  );
};export default BottomNavigation;