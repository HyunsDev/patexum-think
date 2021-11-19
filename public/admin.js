$("#password").val(localStorage.getItem("password"))

function toast(message) {
    $("#toast").text(message)
    $("#toast").removeClass("toast-hide")
    setTimeout(() => {
        $("#toast").addClass("toast-hide")
    }, 2000)

}

function delete_instagram(that) {
    if(!$(that).data("select")) {
        $(that).data("select","true")
        $(that).addClass("work-btn-delete-selected")
        return
    }
    
    const password = $("#password").val()
    $.ajax({
        url: "/admin/delete/instagram",
        data: {
            password : password,
            shortCode: that.id
        },
        type: "POST",
        dataType: "json" 
    }).done(json => {
        if(json.status == "deleted") {
            toast("작품을 삭제했습니다.")
            that.parentNode.parentNode.remove()
            localStorage.setItem("password", password)
        } else if (json.status == "password") {
            toast("키를 확인하세요")
        } else {
            toast("알 수 없는 응답")
        }
    })
}

function delete_twitter(that) {
    if(!$(that).data("select")) {
        $(that).data("select","true")
        $(that).addClass("work-btn-delete-selected")
        return
    }
    
    const password = $("#password").val()
    $.ajax({
        url: "/admin/delete/twitter",
        data: {
            password : password,
            url: that.id
        },
        type: "POST",
        dataType: "json" 
    }).done(json => {
        if(json.status == "deleted") {
            toast("작품을 삭제했습니다.")
            that.parentNode.parentNode.remove()
            localStorage.setItem("password", password)
        } else if (json.status == "password") {
            toast("키를 확인하세요")
        } else {
            toast("알 수 없는 응답")
        }
    })
}