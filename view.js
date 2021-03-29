// ---- Define your dialogs  and panels here ----



// ---- Display file structure ----

// (recursively) makes and returns an html element (wrapped in a jquery object) for a given file object
function make_file_element(file_obj) {
    let file_hash = get_full_path(file_obj)

    if(file_obj.is_folder) {
        let folder_elem = $(`<div class='folder' id="${file_hash}_div">
            <h3 id="${file_hash}_header">
                <span class="oi oi-folder" id="${file_hash}_icon"/> ${file_obj.filename} 
                <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                    <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/> 
                    Edit Permissions
                </button>
            </h3>
        </div>`)

        // append children, if any:
        if( file_hash in parent_to_children) {
            let container_elem = $("<div class='folder_contents'></div>")
            folder_elem.append(container_elem)
            for(child_file of parent_to_children[file_hash]) {
                let child_elem = make_file_element(child_file)
                container_elem.append(child_elem)
            }
        }
        return folder_elem
    }
    else {
        return $(`<div class='file'  id="${file_hash}_div">
            <span class="oi oi-file" id="${file_hash}_icon"/> ${file_obj.filename}
            <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/> 
                Edit Permissions
            </button>
        </div>`)
    }
}

for(let root_file of root_files) {
    let file_elem = make_file_element(root_file)
    $( "#filestructure" ).append( file_elem);    
}



// make folder hierarchy into an accordion structure
$('.folder').accordion({
    collapsible: true,
    heightStyle: 'content'
}) // TODO: start collapsed and check whether read permission exists before expanding?


// -- Connect File Structure lock buttons to the permission dialog --

// open permissions dialog when a permission button is clicked
$('.permbutton').click( function( e ) {
    // Set the path and open dialog:
    let path = e.currentTarget.getAttribute('path');
    perm_dialog.attr('filepath', path)
    perm_dialog.dialog('open')
    //open_permissions_dialog(path)
    console.log(perm_dialog.attr('filepath'))

    // Deal with the fact that folders try to collapse/expand when you click on their permissions button:
    e.stopPropagation() // don't propagate button click to element underneath it (e.g. folder accordion)
    // Emit a click for logging purposes:
    emitter.dispatchEvent(new CustomEvent('userEvent', { detail: new ClickEntry(ActionEnum.CLICK, (e.clientX + window.pageXOffset), (e.clientY + window.pageYOffset), e.target.id,new Date().getTime()) }))
});


// ---- Assign unique ids to everything that doesn't have an ID ----
$('#html-loc').find('*').uniqueId() 

let permpanel = define_new_effective_permissions("permCol", true);
$('#sidepanel').append(permpanel);

let userselect = define_new_user_select_field("user", "Select User To View Their Permissions", function(selected_user){$('#permCol').attr('username', selected_user)});
$('#sidepanel').append(userselect);


//let fileselect = define_new_file_select_field("file", "Select File You Want To View Permissions For",function(selected_user){$('#permCol').attr('filename', selected_user)});
//let fileselect = define_single_select_list("file");
//$('#sidepanel').append(fileselect);

//let pathselect = perm_dialog.attr('filepath')
//console.log(perm_dialog.attr('filepath'))
//$('#permCol').attr('filepath', '/C/presentation_documents/important_file.txt')

//Permissions Explanation
let dialog = define_new_dialog("dialog", "Permission");

$('.perm_info').click(function(){
    console.log(perm_dialog.attr('filepath'))

    console.log('clicked!')
    //console.log($('#permCol').attr('filepath'))
    console.log($('#permCol').attr('username'))
    console.log($(this).attr('permission_name'))

    //let filepathObj = path_to_file[$('#permCol').attr('filepath')]
    let usernameObj = all_users[$('#permCol').attr('username')]
    let permissionObj = $(this).attr('permission_name')
    //let filepathNotObj = String([$('#permCol').attr('filepath')])

    let filepathObj = path_to_file[perm_dialog.attr('filepath')]
    let filepathNotObj = path_to_file[perm_dialog.attr('filepath')]

    var n = filepathNotObj.lastIndexOf("/")
    var fileString = filepathNotObj.substring(n+1)

    console.log(filepathObj)
    let userAction = allow_user_action(filepathObj, usernameObj, permissionObj, true)
    let explanataion = get_explanation_text(userAction, usernameObj, fileString, permissionObj)
    dialog.html(explanataion)
    dialog.dialog('open')
})