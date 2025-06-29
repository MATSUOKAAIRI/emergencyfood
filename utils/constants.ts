export const ERROR_MESSAGES = {
  // Authentication
  INVALID_EMAIL: '無効なメールアドレス形式です。',
  USER_DISABLED: 'このアカウントは無効化されています。',
  INVALID_CREDENTIALS: 'メールアドレスまたはパスワードが間違っています。',
  TOO_MANY_REQUESTS:
    '何度もログインに失敗しました。しばらく待ってから再度お試しください。',
  LOGIN_FAILED: 'ログインに失敗しました。時間をおいて再度お試しください。',
  EMAIL_ALREADY_IN_USE: 'このメールアドレスはすでに使われています。',
  WEAK_PASSWORD: 'パスワードは6文字以上にしてください。',
  REGISTRATION_FAILED: '登録に失敗しました。',
  PASSWORD_CHANGE_FAILED: 'パスワードの変更に失敗しました。',
  NAME_UPDATE_FAILED: '名前の更新に失敗しました。',

  // Team Management
  TEAM_NAME_EXISTS: 'チーム名は既に存在します。',
  TEAM_NOT_FOUND: 'チームが見つかりません。',
  INCORRECT_TEAM_CREDENTIALS: 'チーム名またはパスワードが間違っています。',
  ALREADY_IN_TEAM: '既に他のチームに所属しています。先に脱退してください。',
  TEAM_ID_MISSING:
    'チームIDが設定されていません。チームに参加または作成してください。',
  ADMIN_UPDATE_FAILED: '管理者の更新に失敗しました。',
  TEAM_FETCH_FAILED: 'チーム情報の取得に失敗しました。',

  // Food Management
  FOOD_FETCH_FAILED: 'データの取得に失敗しました。',
  FOOD_ARCHIVE_FAILED: '食品の非表示に失敗しました。',
  FOOD_UPDATE_FAILED: '食品の更新に失敗しました。',
  FOOD_CREATE_FAILED: '食品の登録に失敗しました。',
  FOOD_DELETE_FAILED: '食品の削除に失敗しました。',
  NO_FOODS_REGISTERED: '登録された非常食はありません。',

  // General
  UNAUTHORIZED: '認証が必要です。',
  NETWORK_ERROR: 'ネットワークエラーが発生しました。',
  UNKNOWN_ERROR: '不明なエラーが発生しました。',
  LOADING: 'ロード中...',
  OPERATION_SUCCESS: '操作が完了しました',
} as const;

export const SUCCESS_MESSAGES = {
  TEAM_CREATED: 'チームが作成されました。',
  TEAM_JOINED: 'チームに参加しました。',
  FOOD_ARCHIVED: '食品を非表示にしました。',
  FOOD_RESTORED: '食品を復元しました。',
  FOOD_UPDATED: '食品を更新しました。',
  FOOD_CREATED: '食品を登録しました。',
  FOOD_DELETED: '食品を削除しました。',
  CUSTOM_CLAIMS_SET: 'カスタムクレームが設定されました。',
  LINE_ACCOUNT_LINKED: 'LINEアカウントが連携されました。',
  LINE_ACCOUNT_UNLINKED: 'LINEアカウントの連携が解除されました。',
  PASSWORD_CHANGED: 'パスワードが変更されました。',
  NAME_UPDATED: '名前が更新されました。',
  ADMIN_ADDED: '管理者を追加しました。',
  ADMIN_REMOVED: '管理者を削除しました。',
  LOGOUT_SUCCESS: 'ログアウトしました。',
} as const;

export const UI_CONSTANTS = {
  // Authentication
  LOGIN_TITLE: 'ログイン',
  REGISTER_TITLE: 'ユーザー登録',
  NO_ACCOUNT_MESSAGE: 'まだアカウントをお持ちでない方はこちらから',
  HAS_ACCOUNT_MESSAGE: '既にアカウントをお持ちの方はこちらから',
  REGISTER_LINK: 'ユーザー登録',
  LOGIN_LINK: 'ログイン',

  // Settings
  SETTINGS_TITLE: '設定',
  ACCOUNT_SETTINGS: 'アカウント設定',
  TEAM_SETTINGS: 'チーム設定',
  LINE_NOTIFICATION_SETTINGS: 'LINE通知設定',
  LOGOUT: 'ログアウト',
  ACCOUNT_NAME: 'アカウント名',
  EMAIL_ADDRESS: 'メールアドレス',
  CHANGE_PASSWORD: 'パスワード変更',
  TEAM_NAME: 'チーム名',
  TEAM_OWNER: 'オーナー',
  TEAM_MEMBERS: 'メンバー',
  TEAM_ADMINS: '管理者',
  ADD_ADMIN: '管理者に追加',
  REMOVE_ADMIN: '管理者から削除',
  CONFIRM_LOGOUT: 'ログアウトしますか？',
  CONFIRM_DELETE_FOOD:
    'この非常食を完全に削除しますか？この操作は取り消せません。',

  // Food Management
  CONFIRM_ARCHIVE:
    'この非常食アイテムをリストから非表示にします。もう二度と表示されなくなりますがよろしいですか？（「過去の保存食」ページからは確認できます）',
  TEAM_SELECTION_REQUIRED:
    '食品リストを閲覧するには、いずれかのチームに参加してください。',
  LOGIN_REQUIRED_FOR_REVIEW: '感想を投稿するにはログインが必要です。',

  // Team Management
  CREATE_TEAM_TITLE: '新しいチームを作成',
  JOIN_TEAM_TITLE: '既存のチームに参加',
  TEAM_SELECTION_TITLE: 'チームへの参加または作成',

  // Navigation
  BACK_TO_TEAM_SELECTION: 'チーム選択画面に戻る',
  ADD_NEW_FOOD: '新しい非常食を登録する',
  VIEW_REVIEWS: '感想を見る・書く',

  // Actions
  EDIT: '編集',
  ARCHIVE: '非表示',
  RESTORE: 'リストに戻す',
  DELETE: '削除',
  UPDATE: '更新',
  SUBMIT: '投稿する',
  CANCEL: 'キャンセル',
  CONFIRM: '確認',
  PROCESSING: '処理中...',
  SAVE: '保存',
} as const;

export const API_ENDPOINTS = {
  // Food Management
  ARCHIVE_FOOD: '/api/actions/archive-food',
  RESTORE_FOOD: '/api/actions/restore-food',
  UPDATE_FOOD: '/api/actions/update-food',
  DELETE_FOOD: '/api/actions/delete-food',

  // Team Management
  CREATE_TEAM: '/api/actions/createTeam',
  JOIN_TEAM: '/api/actions/joinTeam',
  ADD_ADMIN: '/api/actions/add-admin',
  REMOVE_ADMIN: '/api/actions/remove-admin',
  MIGRATE_TEAM_DATA: '/api/actions/migrate-team-data',

  // Account Management
  LINK_LINE: '/api/actions/link-line-account',
  UNLINK_LINE: '/api/actions/unlink-line-account',
  UPDATE_USER_NAME: '/api/actions/update-user-name',
  CHANGE_PASSWORD: '/api/actions/change-password',
  SET_TEAM_CLAIM: '/api/setTeamClaim',
  SET_CUSTOM_CLAIMS: '/api/setCustomClaims',
} as const;

export const FOOD_CATEGORIES = [
  '米・パン',
  '麺類',
  '缶詰',
  '乾物',
  '調味料',
  '飲料',
  '菓子',
  'その他',
] as const;

export const STORAGE_LOCATIONS = [
  '冷蔵庫',
  '冷凍庫',
  '常温',
  '棚',
  'その他',
] as const;

export const EXPIRY_WARNING_DAYS = {
  NEAR_EXPIRY: 30,
  CRITICAL_EXPIRY: 7,
} as const;

export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  TEAM_NAME_MIN_LENGTH: 2,
  TEAM_NAME_MAX_LENGTH: 50,
  FOOD_NAME_MAX_LENGTH: 100,
  QUANTITY_MAX: 9999,
  AMOUNT_MAX: 999999,
} as const;

export const DATE_FORMATS = {
  DISPLAY: 'ja-JP',
  INPUT: 'YYYY-MM-DD',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
} as const;
