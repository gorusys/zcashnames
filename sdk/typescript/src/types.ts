export interface Registration {
  name: string;
  address: string;
  txid: string;
  height: number;
  nonce: number;
  signature: string | null;
}

export interface Listing {
  name: string;
  price: number;
  txid: string;
  height: number;
  signature: string;
}

export interface ResolveResult extends Registration {
  listing: Listing | null;
}

export interface ListForSaleResult {
  listings: Listing[];
}

export interface StatusResult {
  synced_height: number;
  admin_pubkey: string;
  uivk: string;
  registered: number;
  listed: number;
}
