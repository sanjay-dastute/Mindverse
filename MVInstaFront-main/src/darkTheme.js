

export const darkTheme = {
  colorBgContainer: "#1e1e1e",
  token: {
    // colorTextHeading: '#ffffff', // Applies to Typography Title
    colorText: '#5D7285', // Applies to Typography Text
  },
  components: {
    Button: {
      colorPrimary: '#333333',
      algorithm: true, // Enable algorithm
    },
    Layout: {
      triggerBg: '#1e1e1e',
      bodyBg: '#1e1e1e'
    },
    Menu: {
      itemActiveBg: "#F3FAFF",
      itemBorderRadius: 4,
      itemSelectedColor: 'white',
      itemColor: '#5D7285',
      itemHeight: "64px",
      iconSize: '32px',
      fontSizeLG: "16px",
      siderBg: "#2d2d2d"
    },
    Modal: {
      contentBg: '#F7F7F7',
      headerBg: '#F7F7F7',
      titleFontSize: '24px',
      titleColor: 'black',
    },
    Input: {
      colorPrimary: '#2d2d2d',
      algorithm: true,
      inputFontSize: "13px",
      paddingBlock: "20px",
      paddingInline: "20px",
      activeBorderColor: "#C2C2C2",
      borderRadius: "12px",
    },
    InputNumber: {
      inputFontSize: "13px",
      paddingBlock: "20px",
      paddingInline: "20px",
      activeBorderColor: "#C2C2C2",
      borderRadius: "12px",
    },
    Form: {
      labelColor: "white",
      labelFontSize: "16px",
      labelHeight: "20px",
      labelRequiredMarkColor: "#F42323",
    },
    Table: {
      headerBg: "#F4F4F5",
      headerColor: "#71717A",
      cellFontSize: "16px",
      cellPaddingBlock: "10px"
    },
  },
}