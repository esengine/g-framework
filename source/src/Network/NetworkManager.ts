module gs {
    export class NetworkManager {
        private networkAdapter: NetworkAdapter | null = null;

        /**
         * 设置网络适配器
         * @param adapter 用户实现的NetworkAdapter接口
         */
        setNetworkAdapter(adapter: NetworkAdapter): void {
            this.networkAdapter = adapter;
        }

        /**
         * 获取网络适配器
         * @returns 
         */
        getNetworkAdapter(): NetworkAdapter | null {
            return this.networkAdapter;
        }
    }
}