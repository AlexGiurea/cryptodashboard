export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      Crypto_Ledger: {
        Row: {
          "Coin Name": string | null
          "Coin status/sector": string | null
          "Crypto symbol": string | null
          "Price of token at the moment": string | null
          "Result of acquisition": string | null
          "Sum (in token)": number | null
          "Sum (in USD)": number | null
          "Transaction Date": string | null
          "Transaction platform": string | null
        }
        Insert: {
          "Coin Name"?: string | null
          "Coin status/sector"?: string | null
          "Crypto symbol"?: string | null
          "Price of token at the moment"?: string | null
          "Result of acquisition"?: string | null
          "Sum (in token)"?: number | null
          "Sum (in USD)"?: number | null
          "Transaction Date"?: string | null
          "Transaction platform"?: string | null
        }
        Update: {
          "Coin Name"?: string | null
          "Coin status/sector"?: string | null
          "Crypto symbol"?: string | null
          "Price of token at the moment"?: string | null
          "Result of acquisition"?: string | null
          "Sum (in token)"?: number | null
          "Sum (in USD)"?: number | null
          "Transaction Date"?: string | null
          "Transaction platform"?: string | null
        }
        Relationships: []
      }
      crypto_transactions: {
        Row: {
          coin_name: string
          coin_status_sector: string | null
          crypto_symbol: string
          id: number
          price_of_token_at_moment: string | null
          result_of_acquisition: string
          sum_in_token: number | null
          sum_in_usd: number | null
          transaction_date: string | null
          transaction_platform: string | null
        }
        Insert: {
          coin_name: string
          coin_status_sector?: string | null
          crypto_symbol: string
          id?: number
          price_of_token_at_moment?: string | null
          result_of_acquisition: string
          sum_in_token?: number | null
          sum_in_usd?: number | null
          transaction_date?: string | null
          transaction_platform?: string | null
        }
        Update: {
          coin_name?: string
          coin_status_sector?: string | null
          crypto_symbol?: string
          id?: number
          price_of_token_at_moment?: string | null
          result_of_acquisition?: string
          sum_in_token?: number | null
          sum_in_usd?: number | null
          transaction_date?: string | null
          transaction_platform?: string | null
        }
        Relationships: []
      }
      Huge_Excel_Sheet: {
        Row: {
          addr_state: string | null
          annual_inc: number | null
          delinq_2yrs: string | null
          dti: number | null
          earliest_cr_line: string | null
          emp_length: string | null
          funded_amnt: number | null
          funded_amnt_inv: number | null
          grade: string | null
          home_ownership: string | null
          inq_last_6mths: string | null
          installment: number | null
          int_rate: string | null
          issue_d: string | null
          loan_amnt: number | null
          open_acc: number | null
          pub_rec: string | null
          purpose: string | null
          revol_bal: number | null
          revol_util: string | null
          sub_grade: string | null
          term: string | null
          total_acc: number | null
          verification_status: string | null
        }
        Insert: {
          addr_state?: string | null
          annual_inc?: number | null
          delinq_2yrs?: string | null
          dti?: number | null
          earliest_cr_line?: string | null
          emp_length?: string | null
          funded_amnt?: number | null
          funded_amnt_inv?: number | null
          grade?: string | null
          home_ownership?: string | null
          inq_last_6mths?: string | null
          installment?: number | null
          int_rate?: string | null
          issue_d?: string | null
          loan_amnt?: number | null
          open_acc?: number | null
          pub_rec?: string | null
          purpose?: string | null
          revol_bal?: number | null
          revol_util?: string | null
          sub_grade?: string | null
          term?: string | null
          total_acc?: number | null
          verification_status?: string | null
        }
        Update: {
          addr_state?: string | null
          annual_inc?: number | null
          delinq_2yrs?: string | null
          dti?: number | null
          earliest_cr_line?: string | null
          emp_length?: string | null
          funded_amnt?: number | null
          funded_amnt_inv?: number | null
          grade?: string | null
          home_ownership?: string | null
          inq_last_6mths?: string | null
          installment?: number | null
          int_rate?: string | null
          issue_d?: string | null
          loan_amnt?: number | null
          open_acc?: number | null
          pub_rec?: string | null
          purpose?: string | null
          revol_bal?: number | null
          revol_util?: string | null
          sub_grade?: string | null
          term?: string | null
          total_acc?: number | null
          verification_status?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
