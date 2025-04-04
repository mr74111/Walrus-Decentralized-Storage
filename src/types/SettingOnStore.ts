export interface SettingOnStore {
    username: string;
    password: string;
    salt: string;
    aggregator: string,
    publisher: string,
    walrusHash: string,       // walrus key
    walrusSalt: string,       // walrus sale
}
