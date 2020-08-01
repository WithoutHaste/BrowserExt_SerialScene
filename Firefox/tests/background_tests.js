function testStripFilename(assert, url, expectedResult) {
	const result = stripFilename(url);
    assert.ok(result == expectedResult, "Passed" );
}

QUnit.test("stripFilename: ends with /", function(assert) {
	testStripFilename(assert, "https://xkcd.com/796/", "https://xkcd.com/");
});

QUnit.test("stripFilename: ends with filename", function(assert) {
	testStripFilename(assert, "http://invisiblecities.comicgenesis.com/001.html", "http://invisiblecities.comicgenesis.com/");
});

QUnit.test("stripFilename: ends with no extension", function(assert) {
	testStripFilename(assert, "https://mangakakalot.com/chapter/mousou_telepathy/chapter_1", "https://mangakakalot.com/chapter/mousou_telepathy/");
});

QUnit.test("stripFilename: yyyy/mm/dd blog format", function(assert) {
	testStripFilename(assert, "https://www.mrmoneymustache.com/2013/03/16/reader-case-study-this-guy-doesnt-need-my-help/", "https://www.mrmoneymustache.com/");
});

QUnit.test("stripFilename: yyyy/m/d blog format", function(assert) {
	testStripFilename(assert, "http://www.basicinstructions.net/basic-instructions/2010/8/4/how-to-be-a-futurist.html", "http://www.basicinstructions.net/basic-instructions/");
});

QUnit.test("stripFilename: http: don't allow entire url to be removed", function(assert) {
	testStripFilename(assert, "http://site.com/", "http://site.com/");
});

QUnit.test("stripFilename: https: don't allow entire url to be removed", function(assert) {
	testStripFilename(assert, "https://site.com/", "https://site.com/");
});

