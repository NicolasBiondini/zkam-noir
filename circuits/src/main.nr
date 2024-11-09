fn main(image: [Field; 10000 * 4], hash_indexes: [Field; 256], hash_to_check: [u8; 256]) {
    assert(hash_indexes.len() == 256);

    let mut hash = [0 as u8; 256];
    for i in 0..256 {
        hash[i] = image[hash_indexes[i] * 4 + 3] as u8 % 2;
    }

    for i in 0..256 {
        assert(hash_to_check[i] == hash[i]);
  }
}
