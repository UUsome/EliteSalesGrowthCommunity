export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              精英销售成长社区
            </h3>
            <p className="text-sm text-gray-500">
              销售人的学习成长平台 — 发现知识、连接专家、交流经验、成就职业。
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">快速链接</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="/experts" className="hover:text-gray-700">销售智库</a></li>
              <li><a href="/jobs" className="hover:text-gray-700">人才集市</a></li>
              <li><a href="/posts" className="hover:text-gray-700">同行交流</a></li>
              <li><a href="/contact" className="hover:text-gray-700">联系我们</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">关于我们</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>用户协议</li>
              <li>隐私政策</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Elite Sales Growth Community. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
