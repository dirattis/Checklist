import {Platform} from 'react-native';

export const styles = {    
    logo: {height:400, width:400},
    main: { flex: 1, padding: 10, backgroundColor: '#fff' },
    colorFont: { color: '#029CC2'},
    colorBackground: { backgroundColor: '#029CC2'},
    headerMain: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    txtBtnAction: {backgroundColor: 'transparent', color: '#fff', fontSize:22 },
    btnAction: {backgroundColor: '#87a8b9', height:35, alignItems:'center', justifyContent:'center', borderRadius:5 },
    whiteTxtBtnAction: {backgroundColor: '#016298', color: '#fff', fontSize:30, fontWeight: 'bold' },
    whiteBtnAction: {backgroundColor: '#016298', height:35, alignItems:'center', justifyContent:'center', borderRadius:5 },
    btnEnabled: {   shadowColor: 'rgba(0,0,0, .4)', // IOS
                    shadowOffset: { height: 1, width: 1 }, // IOS
                    shadowOpacity: 1, // IOS
                    shadowRadius: 1, //IOS
                    elevation: 2 // Android
                },
    btnCircle: {backgroundColor:'#0286cb', height:40, width:40, borderRadius:20, justifyContent:'center', alignItems:'center'},
    viewTxtComentario: {paddingHorizontal:10,  backgroundColor:'#fff', borderRadius:20, 
                        borderColor: 'gray', borderWidth: 1, flex: 4, marginHorizontal: 10},
    txtComentario: { overflow:'hidden', textAlignVertical:'center', fontSize:18},
    viewComentario: { flexDirection:'row', alignItems:'flex-end', flex:1,
                        marginHorizontal: 5, paddingLeft: 5, paddingRight: 5},
    headerFromLeft: { height: Platform.OS === 'android' ? 44 : 54,  flexDirection: 'row', justifyContent:'flex-start', paddingLeft: 10, paddingTop:10}
}

export const logoAnimationDuration = 300;
