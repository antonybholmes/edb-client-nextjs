import type { IFieldMap } from '@interfaces/field-map'
import config from '../config.json'
import versionConfig from '../version.json'

//export const SITE = "https://edb.rdf-lab.org"
export const SITE_NAME = 'Experiments'
export const APP_NAME = SITE_NAME
// id for internally indentifying app and for use in prefixes etc
export const APP_ID = 'edb'
export const SITE_DOMAIN = 'edb.rdf-lab.org'

export const SITE_DESCRIPTION = 'Experiments Application'
export const EMAIL = 'hello@antonyholmes.dev'
export const RECORDS_PER_PAGE = 12
export const SEARCH_RECORDS_PER_PAGE = config.SEARCH_RECORDS_PER_PAGE
export const AUTHOR_LATEST_POSTS = config.AUTHOR_LATEST_POSTS
export const VERSION = versionConfig.version
export const UPDATED = versionConfig.updated
export const GITHUB_URL = config.GITHUB_URL
export const ANIMATION_DURATION_S = 0.25

export const DEFAULT_SECTION = config.DEFAULT_SECTION

export const GENES_BASE_URL = config.GENES_BASE_URL

export const TAG_SLUG = config.TAG_SLUG
export const PAGE_1_SLUG = config.PAGE_1_SLUG

export const YEAR = new Date().getFullYear()

export const SECTIONS = config.SECTIONS
export const TEXT_SHOW_MORE = 'Show More'

export const TEXT_OPEN_FILE = 'Open files from this device'

export const STATUS_CODE_OK = 200

export const STATUS_SUCCESS = 'success'
export const STATUS_FAIL = 'fail'

export const COLOR_THEME = 'theme'

export const TRUE = 'true'
export const FALSE = 'false'

export const TEXT_OK = 'Ok'
export const TEXT_CANCEL = 'Cancel'
export const TEXT_CLEAR = 'Clear'
export const TEXT_CONTINUE = 'Continue'
export const TEXT_CONFIRM = 'Confirm'
export const TEXT_SAVE = 'Save'
export const TEXT_SAVE_AS = 'Save As'
export const TEXT_EXPORT = 'Export'
export const TEXT_RESET = 'Reset'
export const TEXT_UPDATE = 'Update'
export const TEXT_OPEN = 'Open'
export const TEXT_NEW = 'New'

export const TEXT_UNLABELLED = '<Unlabelled>'
export const TEXT_ADD = 'Add'

export interface IDialogParams {
  name: string
  params?: IFieldMap
}

export const NO_DIALOG: IDialogParams = { name: '' }

export const DEFAULT_DATE_FORMAT = 'MM/dd/yyyy'

export const SITE_URL = 'https://edb.rdf-lab.org'
