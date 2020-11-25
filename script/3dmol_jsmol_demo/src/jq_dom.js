// this .js file uses jquery and DOM
// it's used as a middleware by "../express_srv.js"
$(".mol-container").hide();

$("#pdb-submit").click(() => {
  $(".mol-container").show();
  let pdb_code = $("#pdb-input").val();
  pdb_code = pdb_code.replace(/^\s+|\s+$/g, '');
  console.log(pdb_code);
  // 3dmol
  let element = $('#3dMol-container');
  let config = {
    backgroundColor: 0xfffffff
  };
  let viewer = $3Dmol.createViewer(element, config);
  $3Dmol.download(`pdb:${pdb_code}`, viewer, {
    onemol: true,
    multimodel: true
  }, (m) => {
    m.setStyle({
      'cartoon': {
        colorscheme: {
          prop: 'ss',
          map: $3Dmol.ssColors.Jmol
        }
      }
    });
    viewer.zoomTo();
    viewer.render();
  });
  viewer.setBackgroundColor('lightgrey');
  viewer.zoom(1, 2000);

  // jsmol
  let myJmol = 'myJmol';
  let JmolInfo = {
    width: '100%',
    height: '100%',
    color: '#E2F4F4',
    j2sPath: '/assets/JSmol/j2s',
    serverURL: '/assets/JSmol/php/jsmol.php',
    script: `set zoomlarge false; set antialiasDisplay; load =${pdb_code}`,
    use: 'html5'
  }
  $('#jsMol-container').html(Jmol.getAppletHtml(myJmol, JmolInfo));

});

$("#pdb-clear").click(() => {
  $("#pdb-input").val('');
  $(".mol-container").hide();
});