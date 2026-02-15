// ==UserScript==
// @name         Follow Status Changer
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  「公開フォロー」を「非公開フォロー」に変換する
// @author       Ameba Blog User
// @match        https://blog.ameba.jp/ucs/blgfavorite/*
// @match        https://blog.ameba.jp/reader.do?bnm*
// @match        https://blog.ameba.jp/readerend.do*
// @grant        none
// @updateURL        https://github.com/personwritep/Follow_Status_Changer/raw/main/Follow_Status_Changer.user.js
// @downloadURL        https://github.com/personwritep/Follow_Status_Changer/raw/main/Follow_Status_Changer.user.js
// ==/UserScript==


if(document.querySelector('#readerList')){ // フォロー管理ページで有効

    let converted; // 処理したIDの配列
    let read_json=localStorage.getItem('FSC_converted'); // ローカルストレージ名
    converted=JSON.parse(read_json);
    if(converted==null){
        converted=[]; } // 変換処理したIDの配列
    write_local(); //🔴


    function write_local(){
        converted=Array.from(new Set(converted));
        let write_json=JSON.stringify(converted);
        localStorage.setItem('FSC_converted', write_json); } // ローカルストレージ 保存



    status();

    function status(){ //「公開フォロー」を「非公開」に変更
        let k;
        let blog_id=[];
        let status_span=[];
        let del_button=[];
        let blog_name=document.querySelectorAll('input[name="blog_name"]');
        let table_tr=document.querySelectorAll('.tableList tbody tr');

        let info=
            '<div class="info">「承認済み」ボタンをクリックすると'+
            '「公開フォロー」を「非公開フォロー」に自動的に変更します　　'+
            '<button id="fsc_log" type="button">Convert Check</button>'+
            '<style>.info { font-family: inherit; font-size: 12px; margin: 6px 0 -12px; '+
            'padding: 2px 6px 1px; color: #fff; background: #2196f3; } '+
            '.tableList .open { padding: 4px 8px 3px 8px !important; border: 1px solid #ccc; '+
            'border-radius: 4px; background: rgb(195 226 236); cursor: pointer; } '+
            '</style></div>';

        let box=document.querySelector('#ucsMainLeft #notes');
        if(!box.querySelector('.info')){
            box.insertAdjacentHTML('beforeend', info); }



        let open_id=sessionStorage.getItem('FSC'); //🔵
        if(open_id){
            if(open_id!=0){ // 未処理なら実行
                setTimeout(()=>{
                    sessionStorage.setItem('FSC', 0); //🔵
                    let follow_url='https://blog.ameba.jp/reader.do?bnm=' + open_id + '&status=close';
                    let subwin=window.open( follow_url );
                }, 20); }}



        for(k=0; k<table_tr.length; k++){
            blog_id[k]=blog_name[k].getAttribute('value');
            del_button[k]=table_tr[k].querySelector('.btnDelete');
            status_span[k]=table_tr[k].querySelector('.status span');
            if(status_span[k].classList.contains('open')==true){
                win_open(status_span[k], blog_id[k], del_button[k]); }}


        function win_open(span, id, del){ // 公開→非公開の自動変更
            span.onclick=function(){
                converted.push(id);
                write_local(); //🔴
                del.click();
                setTimeout(()=>{ // 対象ブログの削除ボタンを押す
                    let ok=document.querySelector('.minimumApplyButton a:first-child');
                    if(ok){
                        sessionStorage.setItem('FSC', id); //🔵
                        ok.click();
                    }}, 20); }

        } // win_open()



        let fsc_log=document.querySelector('#fsc_log');
        if(fsc_log){
            fsc_log.onclick=function(){
                let read_json=localStorage.getItem('FSC_converted'); // ローカルストレージ名
                converted=JSON.parse(read_json); //🔴

                let tmp=[];
                for(let k=0; k<converted.length; k++){
                    if(!blog_id.includes(converted[k])){
                        tmp.push(converted[k]); }} // 変換履歴でリストに無いものを抽出
                converted=tmp;
                write_local(); // 抽出結果を保存

                if(converted.length==0){
                    alert("変換処理で失われた登録ブログはありません"); }
                else{
                    if(!document.querySelector('#rest')){
                        disp_list(); }
                    else{
                        document.querySelector('#rest').remove(); }}


                function disp_list(){
                    let disp=
                        '<div id="rest">'+
                        '<div class="r_div">変換処理後に未確認のブログです。このリストが無くなるまで'+
                        '他のページもチェックしてください</div>'+
                        '<ul class="r_ul"></ul>'+
                        '<style>'+
                        '#rest { position: fixed; top: 240px; right: 15px; z-index: 200; '+
                        'font: normal 16px/28px Meiryo; padding: 20px; border: 1px solid #119e28; '+
                        'background: #fff; width: 200px; max-height: 300px; overflow-y: scroll; } '+
                        '.r_div { font-size: 14px; line-height: 18px; margin: 0 0 12px; } '+
                        '.r_ul li { border-bottom: 1px solid #ddd; white-space: nowrap; '+
                        'overflow-x: auto; scrollbar-width: none; } '+
                        '.r_ul li a { color: #000; } '+
                        '</style></div>';

                    if(!document.querySelector('#rest')){
                        document.body.insertAdjacentHTML('beforeend', disp); }

                    let r_ul=document.querySelector('.r_ul');
                    if(r_ul){
                        for(let k=0; k<converted.length; k++){
                            let item=
                                '<li><a target="_blank" href="https://ameblo.jp/'+
                                converted[k] +'/">'+ converted[k] +'</a></li>';
                            r_ul.insertAdjacentHTML('beforeend', item); }}
                } // disp_list()
            }
        }

    } // status()

} // フォロー管理ページで有効




if(document.querySelector('#header.rd-header')){ // フォロー登録画面で有効

    changer();

    function changer(){
        let win_url=window.location.search.substring(1,window.location.search.length);
        if(win_url.indexOf('status=close')!=-1){
            if(!document.querySelector('.rd-error._whole .error')){ // 未フォローの状態
                document.querySelector('#secInValidateNumber_01').checked=true; // 非公開を選択
                setTimeout(()=>{
                    document.querySelector('.rd-btnSubmit').click(); //「フォロー」決定ボタンを押す
                }, 40); }
            else{ // フォローしている状態（タイミングが早過ぎた場合）
                if(sessionStorage.getItem('FSC_reload')!=0){ //🔵
                    sessionStorage.setItem('FSC_reload', 0); //🔵 一度だけリロード
                    setTimeout(()=>{
                        location.reload();
                    }, 200); }}}
        else{
            if(location.pathname=='/readerend.do'){ // 処理終了画面の場合
                if(!document.querySelector('.rd-error._whole .error')){
                    window.opener.location.reload(); // 主ウインドウの元ページを開く
                    window.close(); // 処理タブを閉じる
                }
                else{
                    // 不正検知と判定された場合は、処理を停止
                }
            }}

    } // change()

} // フォロー登録画面で有効
