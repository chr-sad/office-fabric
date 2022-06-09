// Your use of the content in the files referenced here is subject to the terms of the license at https://aka.ms/fluentui-assets-license

import {
  IIconOptions,
  IIconSubset,
  registerIcons,
} from '@fluentui-vue/style-utilities'

export function initializeIcons (
  baseUrl: string = '',
  options?: IIconOptions,
): void {
  const subset: IIconSubset = {
    style: {
      MozOsxFontSmoothing: 'grayscale',
      WebkitFontSmoothing: 'antialiased',
      fontStyle: 'normal',
      fontWeight: 'normal',
      speak: 'none',
    },
    fontFace: {
      fontFamily: `"FabricMDL2Icons-9"`,
      src: `url('${baseUrl}fabric-icons-9-c6162b42.woff') format('woff')`,
    },
    icons: {
      AddFavoriteFill: '\uF0C9',
      BufferTimeBefore: '\uF0CF',
      BufferTimeAfter: '\uF0D0',
      BufferTimeBoth: '\uF0D1',
      PublishContent: '\uF0D4',
      ClipboardList: '\uF0E3',
      ClipboardListMirrored: '\uF0E4',
      CannedChat: '\uF0F2',
      SkypeForBusinessLogo: '\uF0FC',
      TabCenter: '\uF100',
      PageCheckedin: '\uF104',
      PageList: '\uF106',
      ReadOutLoud: '\uF112',
      CaretBottomLeftSolid8: '\uF121',
      CaretBottomRightSolid8: '\uF122',
      FolderHorizontal: '\uF12B',
      MicrosoftStaffhubLogo: '\uF130',
      GiftboxOpen: '\uF133',
      StatusCircleOuter: '\uF136',
      StatusCircleInner: '\uF137',
      StatusCircleRing: '\uF138',
      StatusTriangleOuter: '\uF139',
      StatusTriangleInner: '\uF13A',
      StatusTriangleExclamation: '\uF13B',
      StatusCircleExclamation: '\uF13C',
      StatusCircleErrorX: '\uF13D',
      StatusCircleInfo: '\uF13F',
      StatusCircleBlock: '\uF140',
      StatusCircleBlock2: '\uF141',
      StatusCircleQuestionMark: '\uF142',
      StatusCircleSync: '\uF143',
      Toll: '\uF160',
      ExploreContentSingle: '\uF164',
      CollapseContent: '\uF165',
      CollapseContentSingle: '\uF166',
      InfoSolid: '\uF167',
      GroupList: '\uF168',
      ProgressRingDots: '\uF16A',
      CaloriesAdd: '\uF172',
      BranchFork: '\uF173',
      MuteChat: '\uF17A',
      AddHome: '\uF17B',
      AddWork: '\uF17C',
      MobileReport: '\uF18A',
      ScaleVolume: '\uF18C',
      HardDriveGroup: '\uF18F',
      FastMode: '\uF19A',
      ToggleLeft: '\uF19E',
      ToggleRight: '\uF19F',
      TriangleShape: '\uF1A7',
      RectangleShape: '\uF1A9',
      CubeShape: '\uF1AA',
      Trophy2: '\uF1AE',
      BucketColor: '\uF1B6',
      BucketColorFill: '\uF1B7',
      Taskboard: '\uF1C2',
      SingleColumn: '\uF1D3',
      DoubleColumn: '\uF1D4',
      TripleColumn: '\uF1D5',
      ColumnLeftTwoThirds: '\uF1D6',
      ColumnRightTwoThirds: '\uF1D7',
      AccessLogoFill: '\uF1DB',
      AnalyticsLogo: '\uF1DE',
      AnalyticsQuery: '\uF1DF',
      NewAnalyticsQuery: '\uF1E0',
      AnalyticsReport: '\uF1E1',
      WordLogo: '\uF1E3',
      WordLogoFill: '\uF1E4',
      ExcelLogo: '\uF1E5',
      ExcelLogoFill: '\uF1E6',
      OneNoteLogo: '\uF1E7',
      OneNoteLogoFill: '\uF1E8',
      OutlookLogo: '\uF1E9',
      OutlookLogoFill: '\uF1EA',
      PowerPointLogo: '\uF1EB',
      PowerPointLogoFill: '\uF1EC',
      PublisherLogo: '\uF1ED',
      PublisherLogoFill: '\uF1EE',
      ScheduleEventAction: '\uF1EF',
      FlameSolid: '\uF1F3',
      ServerProcesses: '\uF1FE',
      Server: '\uF201',
      SaveAll: '\uF203',
      LinkedInLogo: '\uF20A',
      Decimals: '\uF218',
      SidePanelMirrored: '\uF221',
      ProtectRestrict: '\uF22A',
      Blog: '\uF22B',
      UnknownMirrored: '\uF22E',
      PublicContactCardMirrored: '\uF230',
      GridViewSmall: '\uF232',
      GridViewMedium: '\uF233',
      GridViewLarge: '\uF234',
      Step: '\uF241',
      StepInsert: '\uF242',
      StepShared: '\uF243',
      StepSharedAdd: '\uF244',
      StepSharedInsert: '\uF245',
      ViewDashboard: '\uF246',
      ViewList: '\uF247',
    },
  }

  registerIcons(subset, options)
}
