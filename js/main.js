/**
 * @author LaborAutonomo.org
 */

$(document).on('focus',".to_copy",function(){
    $(this).select();
});

$(document).on('change',"#col_options",function(){
    wp_gallery_tbl_items($(this).val());
});


//converter solution found in http://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
function bytes2size(bytes) {
    var k = 1024;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0)
        return '0 Bytes';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(k)), 10);
    
    return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
}


function get_audio(arr){
    
    identifier  = $('#identifier').val();
    embed_base  = 'https://archive.org/embed/' + identifier;
    link_base   = 'https://archive.org/download/' + identifier;
    audios      = '';
    unique_embed= '';
    embed_alert = '';
    $.each(arr, function(k,v) {
        val = v[1];
        
        //title
        if (val.title) {
            title_audio = val.title;
            if (val.artist) title_audio += " (" + val.artist + ")"
        }
        else{
            title_audio = v[0].substr(1).replace(/\.(mp3|ogg)$/gi,"");
        }
        
        //embed
        
        /*
         BUG!
         The embed fails when there is space in the file name.
         Feel free to a better solution
         * */
        if ((v[0].indexOf(' ')+1)) {
            embed_alert = '<div class="alert"><button type="button" class="close" data-dismiss="alert">&times;</button><strong>Atenção!</strong> Não foi possível criar alguns embeds devido a espaçamentos no nome do arquivo :-/</div>';
            return true; 
        }
        
        embed       = ' [iframe ' + embed_base + v[0] + ' 500 30]';
        iframe      = '<iframe frameborder="0" style="height:30px;width:100%;" src="' + embed_base + v[0] + '">Please upgrade your browser</iframe>';
        
        //link download
        link = ' Download: ';
        link += "<a href='" + link_base + v[0] + "' target='_blank' title='Clique com o botão direito e escolha \"Salvar link como...\"'>" + val.format + " (" + bytes2size(val.size) + ")</a>";
        if (typeof v.optional != 'undefined') link += " | <a href='" + link_base + v.optional[0] + "' target='_blank' title='Clique com o botão direito e escolha \"Salvar link como...\"'>" + v.optional[1].format + " (" + bytes2size(v.optional[1].size) + ")</a>";
        
        text = title_audio + embed + link;
        audios += '<div class="span5" style="min-height:235px;">' + title_audio + '<br/>' + iframe + '<br/>' + link + '<br/>' + ' <textarea id="' + v[0] + '" class="to_copy input-block-level" rows="4" readonly="true">' + text + '</textarea><br/></div>';
    });
    
    if (arr.length > 1 || embed_alert){
        unique_embed = '<div class="span8"><h3>Lista com todos os audios agrupados</h3>';
        unique_embed += '<iframe src="' + embed_base + '&playlist=1" class="input-block-level" height="120" frameborder="0" webkitallowfullscreen="true" mozallowfullscreen="true" allowfullscreen></iframe> <br/>';
        unique_embed += '<input type="text" value="[iframe ' + embed_base + '&playlist=1 500 120]" class="to_copy input-block-level" readonly="true" /> <br/><br/> </div>';
    } 
    
    $('#wp-audio').append('<div id="content_audio" class="row-fluid"></div>');
    $('#wp-audio #content_audio').append('<h1 id="section-audio">Audios</h1>');
    $('#wp-audio #content_audio').append(embed_alert);
    $('#wp-audio #content_audio').append(audios);
    $('#wp-audio #content_audio').append(unique_embed);
}


function get_image(arr){
    identifier = $('#identifier').val();
    link = 'https://archive.org/download/' + identifier;
    img = '';
    $.each(arr, function(k,v) {
        if (typeof v.thumb != 'undefined') {
            text = '<a target="_blank" rel="lightbox" href=" ' + link + v[0] + ' "><img src=" ' + link + v.thumb[0] + ' " title="clique para aumentar"></a>';
            img += '<div class="span3" style="min-height:350px;"> ' + text + '<br/><br/><textarea id="' + v[0] + '" class="to_copy input-block-level" rows="4" readonly="true">' + text + '</textarea> <br/></div>';
        }
    });
    
    $('#wp-gallery #gallery-individual').append(img);
}


function wp_gallery_tbl_items(cols){
    identifier = $('#identifier').val();
    link = 'https://archive.org/download/' + identifier;
    imgs = '';
    n = 0;
    
    /*
     Colspan verify
     * */
    total_img       = arr_image.length;
    cols            = (cols > total_img) ? total_img : cols;
    cols_remainder  = (total_img % cols);
    colspan         = (cols_remainder) ? ((parseInt(cols)) - cols_remainder) + 1 : 0;
    
    gallery = '<table border="0" align="center"><tr>';
    $.each(arr_image, function(k,v) {
        if (typeof v.thumb != 'undefined') {
            n++;
            gallery += '<td' + ((n==total_img && colspan) ? ' colspan="' +colspan+ '" ' : '') + '> <a rel="lightbox" data-lightbox="gallery-tbl" href=" ' + link + v[0] + ' "><img alt="" src="' + link + v.thumb[0] + '"></a> </td>';
            if (n % parseInt(cols) == 0 && n < total_img) gallery += '</tr><tr>';
        } 
    });
    gallery += '</tr></table><br/>';
    
    $('#wp-gallery #gallery-table #content-gallery-table').remove();
    $('#wp-gallery #gallery-table').append('<div id="content-gallery-table" class="row-fluid"></div>');
    
    $('#wp-gallery #content-gallery-table').append(gallery);
    $('#wp-gallery #content-gallery-table').append('<textarea id="gallery" name="gallery" rows="5" class="to_copy input-block-level" readonly="true">' + gallery + '</textarea>');
    
    update_input_field_info();
}


function wp_gallery_tbl_generate(){
    col_options = '<label for="col_options" class="help-inline">Selecione o número de colunas: </label> ';
    col_options += '<select id="col_options" class="span1"><option value="2">2</option><option value="3">3</option><option value="4">4</option></select> <br/>';
    
    $('#wp-gallery #gallery-table').append(col_options);
    wp_gallery_tbl_items(2);
}


function wp_gallery_div_generate(){
    identifier = $('#identifier').val();
    link = 'https://archive.org/download/' + identifier;
    imgs = '';
    
    gallery = '<div style="display:inline-block;">';
    $.each(arr_image, function(k,v) {
        if (typeof v.thumb != 'undefined') {
            gallery += '<div style="float:left;margin:1px;min-height:195px;"> <a rel="lightbox" data-lightbox="gallery-div" href=" ' + link + v[0] + ' "><img alt="" src="' + link + v.thumb[0] + '"></a> </div>';
        }
    });
    gallery += '</div>';
    
    $('#wp-gallery #gallery-divs').append(gallery);
    $('#wp-gallery #gallery-divs').append('<textarea id="gallery" name="gallery" rows="5" class="to_copy input-block-level" readonly="true">&amp;nbsp;\r\n\r\n' + gallery + '\r\n\r\n&amp;nbsp;\r\n\r\n&amp;nbsp;\r\n\r\n&amp;nbsp;\r\n\r\n&amp;nbsp;</textarea>');
}


function wp_gallery_generate(){
    $('#wp-gallery').empty();
    $('#wp-gallery').append('<h1 id="section-image">Galeria de imagens</h1>');
    
    $('#wp-gallery #content').remove();
    $('#wp-gallery').append('<div id="content" class="tabbable"></div>');
    $('#wp-gallery #content').append('<ul class="nav nav-tabs"><li class="active"><a href="#gallery-divs" data-toggle="tab">Colunas dinâmicas</a></li><li><a href="#gallery-table" data-toggle="tab">Colunas fixas</a></li><li><a href="#gallery-individual" data-toggle="tab">Imagens individuais</a></li></ul>');
    $('#wp-gallery #content').append('<div class="tab-content"></div>');
    $('#wp-gallery #content .tab-content').append('<div class="tab-pane active" id="gallery-divs"></div>');
    $('#wp-gallery #content .tab-content').append('<div class="tab-pane" id="gallery-table"></div>');
    $('#wp-gallery #content .tab-content').append('<div class="tab-pane" id="gallery-individual"></div>');
    
    wp_gallery_div_generate();
    wp_gallery_tbl_generate();
    get_image(arr_image);
}


function screen_initialize(){
    $('#elements').empty();
    $('#elements').append('<div id="wp-audio"></div> <div id="wp-gallery"></div>');
}


/*
 :-)
 Customizing the sample with my bookmark
 * */
function get_my_bookmarks(){
    $.ajax({
        url         : '/get-bookmarks.php',
        dataType    : 'json',
        success     : function(data) {
            item = data[Math.floor((Math.random()*data.length-1)+1)]["identifier"];
            $('#url').attr('placeholder','Cole aqui a URL do archive.org (ex.: https://archive.org/details/' + item + ')');
            $('#status').text('ex.: https://archive.org/details/'+item);
        }
    });
}


function update_input_field_info(){
    $('input[readonly="true"],textarea[readonly="true"]').attr('title','Selecione o conteúdo, copie e cole no artigo do seu blog (preferencialmente wordpress)');
}

function sidebar_generate(){
    $("#result h1").each(function(index) {
        $("#arch-navbar").append('<li><a href="#' + $(this).attr('id') + '"><i class="icon-chevron-left"></i>' + $(this).text() + '</a></li>');
    });
}

var arr_image;

$(document).ready(function() {
    
    $('#url').change(function() {
        url = $.trim($(this).val());
        arr_image = new Array();
        arr_audio = new Array();
        n_images = 0;
        n_audios = 0;
        
        if (!url) {
            $('#status').text('Por favor, digite a URL do archive.org!').attr('class','text-error');
            $('#url').val('');
            return false;
        }
        
        $("#arch-navbar").empty();
        $('#result').css('display','none');
        $('#status').text('buscando dados, aguarde...').attr('class','help-block');
        
        $.ajax({
            url         : '/get-details-page.php',
            type        : 'post',
            data        : 'url=' + url,
            dataType    : 'json',
            error       : function(jqXHR,textStatus,errorThrown ){
                $('#status').text('Erro! Por favor, verifique a URL').attr('class','text-error');
                console.log(jqXHR,textStatus,errorThrown);
            },
            success     : function(data) {
                
                screen_initialize();
                
                $('#title').val(data.metadata.title[0]);
                                            
                $('#description').text(data.metadata.description[0]);
                $('#tags').val( $.each(data.metadata.subject, function(i_tag, v_tag) {return v_tag+','}) );
                $('#identifier').val(data.metadata.identifier[0]);
                
                $.each(data.files, function(key, value) {
                    
                    //image
                    if (value.format.match(/jpeg|png/gi)) {
                        if (value.format.match(/thumb/gi)) {
                            arr_image[n_images-1]['thumb'] = [key,value];
                        }
                        else {
                            arr_image[n_images] = [key,value];
                            n_images++;
                        }
                        return true;
                    }
                    
                    //audio
                    if (value.format.match(/(ogg vorbis|mp3)/gi)) {
                        if (value.source == 'derivative') {
                            arr_audio[n_audios-1]['optional'] = [key,value];
                        }
                        else {
                            arr_audio[n_audios] = [key,value];
                            n_audios++;
                        }
                        return true;
                    }
                });
                
                if (arr_audio.length) get_audio(arr_audio);
                
                if (arr_image.length) {
                    wp_gallery_generate();
                }
                
                $('#result').css('display','block');
                $('#status').text('Pronto!').attr('class','text-success');
                
                update_input_field_info();
                sidebar_generate();
                
                $('body').scrollspy({target: "#arch-navbar-spy"});
                $('[data-spy="scroll"]').each(function () {
                    var $spy = $(this).scrollspy('refresh');
                });
            }
        });
    });
    
    if($('#url').val())
        $('#url').change();
    else
        get_my_bookmarks();
});