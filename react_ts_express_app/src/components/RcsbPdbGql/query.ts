import gql from 'graphql-tag';

export const QUERY_GET_PDB_BASIC = gql`
    query GetPdbBasic($entry_id: String!) {
        entry(entry_id: $entry_id) {
            polymer_entities {
              entity_poly {
                rcsb_sample_sequence_length
              }
            }
            rcsb_entry_container_identifiers {
              rcsb_id
              entity_ids
              pubmed_id
              branched_entity_ids
              polymer_entity_ids
              non_polymer_entity_ids
            }
            cell {
              angle_alpha
              angle_beta
              angle_gamma
              length_a
              length_b
              length_c
              pdbx_unique_axis
            }
        }
    }
`;

export const QUERY_MAP_PDB_TO_UNIPROT = gql`
    query MapPdbToUniprot($entry_id: String!, $entity_id: String!) {
        polymer_entity(entry_id: $entry_id, entity_id: $entity_id) {
            entity_poly {
              pdbx_strand_id
              pdbx_seq_one_letter_code
              pdbx_seq_one_letter_code_can
            }
            rcsb_polymer_entity_container_identifiers {
              uniprot_ids
            }
        }
    }
`;

export const QUERY_GET_UNIPROT_BASIC = gql`
    query GetUniprotBasic($uniprot_id: String!) {
        uniprot(uniprot_id: $uniprot_id) {
            rcsb_uniprot_accession
            rcsb_uniprot_entry_name
            rcsb_uniprot_protein {
              sequence
            }
        }
    }
`;