
const bookmarkRoot = document.getElementById("bookmark_root");

const bookmarkTreePromise = browser.bookmarks.getTree();
bookmarkTreePromise.then(displayBookmarkTree, onRejected);

function displayBookmarkItem(item, root, level) {
	if(item.url) {
		displayBookmarkUrl(item, root);
	}
	else {
		displayBookmarkFolder(item, root, level);
	}

	function displayBookmarkUrl(item, root) {
		if(item.unmodifiable) {
			return;
		}
		if(item.url.startsWith("place")) {
			return;
		}
		if(item.url.startsWith("data")) {
			return;
		}
		
		let div = document.createElement('div');

		let checkbox = document.createElement('input');
		checkbox.setAttribute("type", "checkbox");
		checkbox.style.display = "inline";
		div.appendChild(checkbox);
		
		let label = document.createElement('span');
		if(item.title == null || item.title.length == 0) {
			label.innerHTML = item.url;
		}
		else {
			label.innerHTML = item.title;
		}
		div.appendChild(label);

		root.appendChild(div);
	}
	
	function displayBookmarkFolder(folder, root, level) {
		if(folder.children.length == 0) {
			return;
		}
		
		let div = document.createElement('div');
		div.classList.add("folder");
		
		let checkbox = document.createElement('input');
		checkbox.setAttribute("type", "checkbox");
		checkbox.style.display = "inline";
		div.appendChild(checkbox);
		
		let label = document.createElement('div');
		label.style.display = "inline";
		label.classList.add("folder_label");
		label.innerHTML = "📁 " + folder.title;
		div.appendChild(label);
		
		let contents = document.createElement('div');
		contents.classList.add("folder_contents");
		if(level > 1) {
			contents.style.display = "none";
		}
		div.appendChild(contents);

		label.onclick = function(event) {
			let label = event.target;
			let contents = label.nextSibling;
			if(contents.style.display == "none") {
				contents.style.display = "block";
			}
			else {
				contents.style.display = "none";
			}
		};

		root.appendChild(div);

		displayBookmarkTree(folder.children, contents, level + 1);
	}
}

function displayBookmarkTree(items, root, level) {
	if(root == null) {
		root = bookmarkRoot;
		level = 1;
	}
	for(let i=0; i<items.length; i++)
	{
		displayBookmarkItem(items[i], root, level);
	}
}

function onRejected(error) {
	console.log(`Error: ${error}`);
}

