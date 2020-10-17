// this .js file uses jquery and DOM
// it's used as a middleware by "../express_srv.js"
$(".mol-container").hide();

$("#pdb-submit").click(() => {
  $(".mol-container").show();
  let pdb_code = $("#pdb-input").val();
  let element = $('#container-01');
  let config = {
    backgroundColor: 0xfffffff
  };
  let viewer = $3Dmol.createViewer(element, config);
  $3Dmol.download('pdb:' + pdb_code, viewer, {
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
  viewer.zoom(0.8, 2000);
});

$("#pdb-clear").click(() => {
  $("#pdb-input").val('');
  $(".mol-container").hide();
});
